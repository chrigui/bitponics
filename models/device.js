var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
  	ObjectId = Schema.ObjectId,
  	DeviceTypeModel = require('./deviceType').model,
  	ActionOverrideLogModel = require('./actionOverrideLog').model,
  	ActionUtils = require('./action').utils;


/***************** SCHEMA **********************/

var DeviceSchema = new Schema({
	deviceId: { type: String, required: true, unique: true }, //mac address
	deviceType: { type: ObjectId, ref: 'DeviceType', required: false },
	name : { type: String },
	owner : { type: ObjectId, ref: 'User', required: true},
	users : [ { type: ObjectId, ref: 'User', required: true }],
	userAssignments : [
		{
			ts : { type : Date, default: Date.now, required : true},
			user : { type : ObjectId, ref: 'User', required: true },
			assignmentType: { type : String, enum : ['owner', 'member']}
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
	recentSensorLogs : [{
		ts: { type: Date, required: true, default: Date.now },
		logs : [{
			// sCode references Sensor.code
			sCode: { type: String, ref: 'Sensor', required: true },
			value: { type: Number }
		}]
	}],
	activeGrowPlanInstance : { type: ObjectId, ref: 'GrowPlanInstance', required: false},
	activePhase : { type: ObjectId, ref: 'Phase', required: false },
	
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
	 * activeActionsOverride are any automatically or manually triggered actions. 
	 * They override the phase cycles until they expire.
	 * 
	 * If expired, it's refreshed inside refresh_status
	 */
	activeActionsOverride : {
		actionOverrideLogs: [{ type: ObjectId, ref: 'ActionOverrideLog'}],
		deviceMessage : { type : String },
		lastSent: Date,
		expires : Date
	}
});

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
 */
DeviceSchema.method('refreshActiveActionsOverride', function(callback) {
	var device = this,
		now = new Date();
  	  	
  	ActionOverrideLogModel
  	.find({ gpi : device.activeGrowPlanInstance })
  	.where('expires').gt(now)
  	.sort('-timeRequested')
  	.populate('action')
  	.exec(function(err, actionOverrideLogResults){
  		if (err) { return callback(err);}

  		var conflictingActionOverrideIds = [],
  			conflictingActionOverrideIndices = [],
  			existingActionOverrideControls = {},
  			soonestActionOverrideExpiration = now + (365 * 24 * 60 * 60 * 1000),
  			deviceMessage = '',
  			cycleTemplate = DeviceUtils.cycleTemplate;

  		// first, ensure that the results are clean. results are sorted by 
  		// descending timeRequested, so the last ones in take precedence. 
  		// eliminate conflicts by expiring them.
  		actionOverrideLogResults.forEach(function(actionOverrideLog, index){
  			if (existingActionOverrideControls[actionOverrideLog.action.control]){
  				conflictingActionOverrideIds.push(actionOverrideLog._id);
  				conflictingActionOverrideIndices.push(index);
  				return;
  			}
  			
  			existingActionOverrideControls[actionOverrideLog.action.control] = true;
  			
  			if (actionOverrideLog.expires < soonestActionOverrideExpiration) { 
  				soonestActionOverrideExpiration = actionOverrideLog.expires;
  			}
  		});

  		if (conflictingActionOverrideIds.length > 0){
  			ActionOverrideLogModel.update({_id : {$in: conflictingActionOverrideIds}}, { expires : now - 1000 }).exec();	

  			conflictingActionOverrideIndices.forEach(function(indexToRemove, index){
			  	// since we're removing elements from the target array as we go,
			  	// the indexToRemove will be off by however many we've removed so far
			  	indexToRemove -= index;
		  		actionOverrideLogResults.splice(indexToRemove, 1);
		  	});
  		}

		// ok, now we're clean.
		// replace device.activeActionsOverride.actionOverrideLogs with the result set
  		device.activeActionsOverride.actionOverrideLogs = actionOverrideLogResults;//.map(function(actionOverrideLog){return actionOverrideLog._id;});

  		// generate new device message. compare with current deviceMessage.
  		device.controlMap.forEach(
          function(controlOutputPair){
            var thisCycleString = cycleTemplate.replace(/{outputId}/,controlOutputPair.outputId),
                controlActionOverrideLog = actionOverrideLogResults.filter(function(actionOverrideLog){ return actionOverrideLog.action.control.equals(controlOutputPair.control);})[0],
                controlAction;
              
            // Need an entry for every control, even if there's no associated cycle
            if (!controlActionOverrideLog){ 
              // if no action, just 0 everything out
              thisCycleString = thisCycleString.replace(/{override}/, '0');
              thisCycleString = thisCycleString.replace(/{offset}/, '0');
              thisCycleString = thisCycleString.replace(/{value1}/, '0');    
              thisCycleString = thisCycleString.replace(/{duration1}/, '0');    
              thisCycleString = thisCycleString.replace(/{value2}/, '0');    
              thisCycleString = thisCycleString.replace(/{duration2}/, '0');     
            } else {
    		  controlAction = controlActionOverrideLog.action;
              thisCycleString = thisCycleString.replace(/{override}/, '1');
              // overrides are assumed to be immediate actions, so offset will always be 0
              thisCycleString = thisCycleString.replace(/{offset}/, '0');
              thisCycleString = ActionUtils.updateCycleTemplateWithStates(thisCycleString, controlAction.cycle.states).cycleString;  
            }
            deviceMessage += thisCycleString;  
          }
        );  
  		
  		if (device.activeActionsOverride.deviceMessage == deviceMessage){
  			return callback();
  		}

		device.activeActionsOverride.deviceMessage = deviceMessage;
		device.activeActionsOverride.lastSent = null;
		device.activeActionsOverride.expires = soonestActionOverrideExpiration;
		device.activeActions.deviceRefreshRequired = true;

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
		logsToRemove = [];
	
	device.recentSensorLogs.forEach(function(log){
		if (log.ts < cutoff) { logsToRemove.push(log); }
	});

	logsToRemove.forEach(function(log){
		log.remove();
	});

	next();
});

/***************** END MIDDLEWARE **********************/



/***************** UTILS **********************/
var DeviceUtils = {
	cycleTemplate : '{outputId},{override},{offset},{value1},{duration1},{value2},{duration2};'
};
/***************** END UTILS **********************/

exports.schema = DeviceSchema;
exports.model = mongoose.model('Device', DeviceSchema);
exports.utils = DeviceUtils;