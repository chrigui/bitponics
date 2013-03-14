var mongoose = require('mongoose'),
	  mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	mongoosePlugins = require('../lib/mongoose-plugins'),
	  useTimestamps = mongoosePlugins.useTimestamps,
  	ObjectId = Schema.ObjectId,
  	DeviceTypeModel = require('./deviceType').model,
    ActionModel = require('./action').model,
  	ImmediateActionModel = require('./immediateAction').model,
  	SensorLogSchema = require('./sensorLog').schema
  	winston = require('winston');


/***************** UTILS **********************/
var DeviceUtils = {
	cycleTemplate : '{outputId},{override},{offset},{value1},{duration1},{value2},{duration2};',
	ROLES : {
		OWNER : 'owner',
		MEMBER : 'member'
	}
};
/***************** END UTILS **********************/

/***************** SCHEMA **********************/

var DeviceSchema = new Schema({
	macAddress: { type: String, required: true, unique: true }, //mac address
	deviceType: { type: ObjectId, ref: 'DeviceType', required: false },
	name : { type: String },
	owner : { type: ObjectId, ref: 'User'},
	users : [ { type: ObjectId, ref: 'User'}],
	userAssignmentLogs : [
		{
			ts : { type : Date, default: Date.now, required : true},
			user : { type : ObjectId, ref: 'User', required: true },
			assignmentType: { type : String, enum : [DeviceUtils.ROLES.OWNER, DeviceUtils.ROLES.MEMBER ]}
		}
	],
	sensorMap : [
      { 
	    sensor : { type: ObjectId, ref: 'Sensor' },
	    inputId : { type: String }
	  }
	],
	controlMap : [ 
	  { 
	    control : { type: ObjectId, ref: 'Control' },
	    outputId : { type: String }
	  }
	],
	recentSensorLogs : [SensorLogSchema],
	activeGrowPlanInstance : { type: ObjectId, ref: 'GrowPlanInstance', required: false},
	
	/**
	 *  Cache of the active phase actions for this device. Right now it's
	 *  refreshed inside of /api/device/:id/cycles
	 *  
	 */
	activeActions : {
		actions : [{type: ObjectId, ref: 'Action'}],
		deviceMessage : String,
		lastSent : Date,
		expires : Date,
		deviceRefreshRequired : { type: Boolean, default: true }
	},

	/**
	 * activeImmediateActions are any automatically or manually triggered actions. 
	 * They override the phase cycles until they expire.
	 * 
	 * If expired, it's refreshed inside refresh_status
	 */
	activeImmediateActions : {
		immediateActions: [{ type: ObjectId, ref: 'ImmediateAction'}],
		deviceMessage : { type : String },
		lastSent: Date,
		expires : Date
	}
},
{ id : false });

DeviceSchema.plugin(useTimestamps);

/***************** END SCHEMA PROPERTIES **********************/


/**
 * Add indexes. Do it here after all the fields have been added
 *
 */



/************** INSTANCE METHODS ************************/

/**
 * Remove expired actions & update deviceMessage & expires times. 
 * Saves the model at the end.
 * Originally written to be called after adding an entry to ImmediateAction collection.
 */
DeviceSchema.method('refreshActiveImmediateActions', function(callback) {
	var device = this,
		now = new Date();
  	  	
  	ImmediateActionModel
  	.find({ gpi : device.activeGrowPlanInstance })
  	.where('e').gt(now)
  	.sort('-tr')
  	.populate('a')
  	.exec(function(err, immediateActionResults){
  		if (err) { return callback(err);}

  		var conflictingImmediateActionIds = [],
  			conflictingImmediateActionIndices = [],
  			existingImmediateActionControls = {},
  			soonestImmediateActionExpiration = now + (365 * 24 * 60 * 60 * 1000),
  			deviceMessage = '',
  			cycleTemplate = DeviceUtils.cycleTemplate;

  		// first, ensure that the results are clean. results are sorted by 
  		// descending timeRequested, so the last ones in take precedence. 
  		// eliminate conflicts by expiring them.
  		immediateActionResults.forEach(function(immediateAction, index){
  			if (existingImmediateActionControls[immediateAction.action.control]){
  				conflictingImmediateActionIds.push(immediateAction._id);
  				conflictingImmediateActionIndices.push(index);
  				return;
  			}
  			
  			existingImmediateActionControls[immediateAction.action.control] = true;
  			
  			if (immediateAction.expires < soonestImmediateActionExpiration) { 
  				soonestImmediateActionExpiration = immediateAction.expires;
  			}
  		});

  		if (conflictingImmediateActionIds.length > 0){
  			ImmediateActionModel.update({_id : {$in: conflictingImmediateActionIds}}, { e : now - 1000 }).exec();	

  			conflictingImmediateActionIndices.forEach(function(indexToRemove, index){
			  	// since we're removing elements from the target array as we go,
			  	// the indexToRemove will be off by however many we've removed so far
			  	indexToRemove -= index;
		  		immediateActionResults.splice(indexToRemove, 1);
		  	});
  		}

		// ok, now we're clean.
		// replace device.activeImmediateActions.immediateActions with the result set
  		device.activeImmediateActions.immediateActions = immediateActionResults;//.map(function(immediateAction){return immediateAction._id;});

  		// generate new device message. compare with current deviceMessage.
  		device.controlMap.forEach(
          function(controlOutputPair){
            var thisCycleString = cycleTemplate.replace(/{outputId}/,controlOutputPair.outputId),
                controlImmediateAction = immediateActionResults.filter(function(immediateAction){ return immediateAction.action.control.equals(controlOutputPair.control);})[0],
                controlAction;
              
            // Need an entry for every control, even if there's no associated cycle
            if (!controlImmediateAction){ 
              // if no action, just 0 everything out
              thisCycleString = thisCycleString.replace(/{override}/, '0');
              thisCycleString = thisCycleString.replace(/{offset}/, '0');
              thisCycleString = thisCycleString.replace(/{value1}/, '0');    
              thisCycleString = thisCycleString.replace(/{duration1}/, '0');    
              thisCycleString = thisCycleString.replace(/{value2}/, '0');    
              thisCycleString = thisCycleString.replace(/{duration2}/, '0');     
            } else {
    		  controlAction = controlImmediateAction.action;
              thisCycleString = thisCycleString.replace(/{override}/, '1');
              // overrides are assumed to be immediate actions, so offset will always be 0
              thisCycleString = thisCycleString.replace(/{offset}/, '0');
              thisCycleString = ActionModel.updateCycleTemplateWithStates(thisCycleString, controlAction.cycle.states).cycleString;
            }
            deviceMessage += thisCycleString;  
          }
        );  
  		
  		if (device.activeImmediateActions.deviceMessage == deviceMessage){
  			return callback();
  		}

		device.activeImmediateActions.deviceMessage = deviceMessage;
		device.activeImmediateActions.lastSent = null;
		device.activeImmediateActions.expires = soonestImmediateActionExpiration;
		device.activeActions.deviceRefreshRequired = true;

		winston.info('refreshActiveImmediateActions for device ' + device._id + ' ' + JSON.stringify(device.activeImmediateActions));
		device.save(callback);
  	});
});
/**************** END INSTANCE METHODS ****************************/



/***************** MIDDLEWARE **********************/

/**
 *  HACK : if DeviceType is unassigned, assign it the 'Bitponics Beta Device 1' DeviceType
 *  In production, every device produced should actually get a database entry. And maybe 
 *  we should have a blank deviceType or something as fallback
 */
DeviceSchema.pre('save', function(next){
	var device = this;
	if(device.deviceType){ return next(); }

	DeviceTypeModel.findOne({ name: 'Bitponics Beta Device 1' }, function(err, deviceType){
		if (err) { return next(err); }
		device.deviceType = deviceType;
		next();
	});
});

/**
 *  If sensorMap is undefined then use the deviceType's default sensorMap
 */
DeviceSchema.pre('save', function(next){
	var device = this;
	if(device.sensorMap){ return next(); }

	DeviceTypeModel.findOne({ _id: device.deviceType }, function(err, deviceType){
		if (err) { return next(err); }
		device.sensorMap = deviceType.sensorMap;
		next();
	});
});

/**
 *  If controlMap is undefined then use the deviceType's default controlMap
 */
DeviceSchema.pre('save', function(next){
	var device = this;
	if(device.controlMap){ return next(); }

	DeviceTypeModel.findOne({ _id: device.deviceType }, function(err, deviceType){
		if (err) { return next(err); }
		device.controlMap = deviceType.controlMap;
		next();
	});
});

/**
 * Remove old recentSensorLogs
 */
DeviceSchema.pre('save', function(next){
	var device = this,
		now = Date.now(),
		cutoff = now - (1000 * 60 * 2), // now - 2 hours
		//cap = 10,
		logsToRemove = [];
	
	/*
	while (device.recentSensorLogs.length > cap){
		device.recentSensorLogs.pop();
	}
	*/
	
	device.recentSensorLogs.forEach(function(log){
		if (log.ts < cutoff) { logsToRemove.push(log); }
	});

	logsToRemove.forEach(function(log){
		log.remove();
	});
	
	next();
});

/***************** END MIDDLEWARE **********************/


exports.schema = DeviceSchema;
exports.model = mongoose.model('Device', DeviceSchema);
exports.utils = DeviceUtils;