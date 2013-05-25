var mongoose = require('mongoose'),
  mongooseTypes = require('mongoose-types'),
  Schema = mongoose.Schema,
  mongoosePlugins = require('../lib/mongoose-plugins'),
  useTimestamps = mongoosePlugins.useTimestamps,
  ObjectIdSchema = Schema.ObjectId,
  DeviceTypeModel = require('./deviceType').model,
  ActionModel = require('./action').model,
  ImmediateActionModel = require('./immediateAction').model,
  //SensorLogSchema = require('./sensorLog').schema,
  async = require('async'),
  winston = require('winston'),
  i18nKeys = require('../i18n/keys'),
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils'),
  mongooseConnection = require('../config/mongoose-connection').defaultConnection;


/***************** UTILS **********************/
var DeviceUtils = {
  //cycleTemplate : '{outputId},{override},{offset},{value1},{duration1},{value2},{duration2};',
  stateTemplate : '{outputId},{value};',
  ROLES : {
    OWNER : 'owner',
    MEMBER : 'member'
  }
};
/***************** END UTILS **********************/









var SensorMapSchema = new Schema({
  sensor : { type: ObjectIdSchema, ref: 'Sensor' },
  inputId : { type: String }
},
{ id : false, _id : false });

var OutputMapSchema = new Schema({
  control : { type: ObjectIdSchema, ref: 'Control' },
  outputId : { type: String }
},
{ id : false, _id : false });

/***************** SCHEMA **********************/

var DeviceSchema = new Schema({
    
    _id : {
      type : String,
      match: /^([a-z0-9_-]){12}$/,
      required : true,
      unique : true
    },
    
    //macAddress: { type: String, required: true, unique: true }, //mac address

    serial: { type : String, required: true, unique: true},
    
    deviceType: { type: ObjectIdSchema, ref: 'DeviceType', required: false },
    
    name : { type: String },
    
    owner : { type: ObjectIdSchema, ref: 'User'},
    
    users : [ { type: ObjectIdSchema, ref: 'User'}],
    
    userAssignmentLogs : [
      {
        ts : { type : Date, default: Date.now, required : true},
        user : { type : ObjectIdSchema, ref: 'User', required: true },
        assignmentType: { type : String, enum : [DeviceUtils.ROLES.OWNER, DeviceUtils.ROLES.MEMBER ]}
      }
    ],
    
    sensorMap : [ SensorMapSchema ],
    
    outputMap : [ OutputMapSchema ],
    
    //recentSensorLogs : [ SensorLogSchema ],
  
    activeGrowPlanInstance : { type: ObjectIdSchema, ref: 'GrowPlanInstance', required: false},

    /**
     * Current device status. Actions and ImmediateActions are just a denormalized 
     * view into Actions and ImmediateActions.
     * 
     */
    status : {
      
      actions : [{type: ObjectIdSchema, ref: 'Action'}],
      
      immediateActions: [{ type: ObjectIdSchema, ref: 'ImmediateAction'}],
      
      /** 
       * The consolidated list of immediateActions+actions
       */
      activeActions : [{type: ObjectIdSchema, ref: 'Action'}],
      
      calibrationMode : { 
        type : String, 
        enum : [ 
          feBeUtils.CALIB_MODES.PH_4,
          feBeUtils.CALIB_MODES.PH_7,
          feBeUtils.CALIB_MODES.PH_10,
          feBeUtils.CALIB_MODES.EC_LO,
          feBeUtils.CALIB_MODES.EC_HI
        ]
      },
      
      lastSent : Date,
      
      expires : Date
    }
  },
  { id : false });

DeviceSchema.plugin(useTimestamps);

/***************** END SCHEMA PROPERTIES **********************/




/*************** SERIALIZATION *************************/

/**
 * Remove the db-only-optimized property names and expose only the friendly names
 *
 * "Transforms are applied to the document and each of its sub-documents"
 * http://mongoosejs.com/docs/api.html#document_Document-toObject
 */
DeviceSchema.set('toObject', {
  getters : true,
  transform : function(doc, ret, options){
    //if (doc.schema === SensorLogSchema){
      //return SensorLogSchema.options.toObject.transform(doc, ret, options);
    //} else {
      // else we're operating on the parent doc (the Device doc)
    //}
  }
});
DeviceSchema.set('toJSON', {
  getters : true,
  transform : DeviceSchema.options.toObject.transform
});
/*************** END SERIALIZATION *************************/



/************** INSTANCE METHODS ************************/

/**
 * 
 * Remove expired actions & update deviceMessage & expires times.
 * Saves the model at the end.
 * 
 * Called in the following scenarios:
 *   - after adding an entry to ImmediateAction collection 
 *   - in device /status if device.status is expired
 *   - when activating a phase on the activeGrowPlanInstance
 * 
 * @param {function(err, Device)} callback
 */
DeviceSchema.method('refreshStatus', function(callback) {
  var device = this,
      GrowPlanInstance = require('./growPlanInstance'),
      GrowPlanInstanceSchema = GrowPlanInstance.schema,
      GrowPlanInstanceModel = GrowPlanInstance.model,
      GrowPlan = require('./growPlan').growPlan,
      GrowPlanSchema = GrowPlan.schema,
      GrowPlanModel = GrowPlan.model,
      getObjectId = require('./utils').getObjectId,
      now = new Date(),
      nowAsMilliseconds = now.valueOf(),
      deviceOwner,
      activeGrowPlanInstance,
      newDeviceStatus = {};
      

  if (!device.activeGrowPlanInstance) { 
    device.status.expires = Date.now();
    device.status.actions = [];
    device.status.immediateActions = [];
    device.status.activeActions = [];
    device.status.lastSent = undefined;
    device.save(callback);
    return;
  }

  async.waterfall(
    [
      function getGrowPlanInstance(innerCallback){
        if (device.activeGrowPlanInstance.schema === GrowPlanInstanceSchema){
          return innerCallback(null, device.activeGrowPlanInstance);
        }

        GrowPlanInstanceModel
        .findById(getObjectId(device.activeGrowPlanInstance))
        .exec(innerCallback);
      },
      
      function getPopulatedGrowPlan(activeGrowPlanInstanceResult, innerCallback){
        activeGrowPlanInstance = activeGrowPlanInstanceResult;

        GrowPlanModel.findById(activeGrowPlanInstance.growPlan)
        .populate('phases.actions')
        .exec(innerCallback)
      },

      function processPhaseActions(growPlan, innerCallback) {
        var activeGrowPlanInstancePhase = activeGrowPlanInstance.phases.filter(function(item){ return item.active === true; })[0];
          
        if (!activeGrowPlanInstancePhase){
          return innerCallback(
            new Error(i18nKeys.get("No active phase found for this grow plan instance."))
          );
        }
        
        var activeGrowPlanPhase = growPlan.phases.filter(
          function(item){
            return item._id.equals(getObjectId(activeGrowPlanInstancePhase.phase));
          }
        )[0];

        // get the actions that have a control reference & a cycle definition & are repeating
        var actions = activeGrowPlanPhase.actions || [];
        actions = actions.filter(
          function(action){ 
            return !!action.control && !!action.cycle && !!action.cycle.repeat; 
          }
        );

        newDeviceStatus.actions = actions;

        // Expires at the expected end of the current phase.
        // now + (total expected phase time - elapsed phase time)
        // TODO : or...if phase transitions have to be manually approved,
        // should this just expire like 1 year into the future and get refreshed
        // on phase transitions?
        if (activeGrowPlanPhase.expectedNumberOfDays){
          newDeviceStatus.expires = 
            nowAsMilliseconds + 
            (
              (activeGrowPlanPhase.expectedNumberOfDays * 24 * 60 * 60 * 1000) -
              (nowAsMilliseconds - activeGrowPlanInstancePhase.startDate)
            );
        } else {
          // If phase.expectedNumberOfDays is undefined, means the phase is infinite.
          // Make the device check back in in a year anyway.
          newDeviceStatus.expires = nowAsMilliseconds + (365*24*60*60*1000);
        }      

        return innerCallback();
      },

      function processImmediateActions(innerCallback){
        ImmediateActionModel
        .find({ gpi : device.activeGrowPlanInstance })
        .where('e').gt(now)
        .sort('-tr')
        .populate('a')
        .exec(function(err, immediateActionResults){
          if (err) { return innerCallback(err);}

          var conflictingImmediateActionIds = [],
            conflictingImmediateActionIndices = [],
            existingImmediateActionControls = {},
            soonestImmediateActionExpiration = nowAsMilliseconds + (365 * 24 * 60 * 60 * 1000);
            
          // first, ensure that the results are clean. immediateActionResults are returned sorted by
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
            // Expire all the expired ImmediateActions. Deciding not to wait on the result to move forward
            ImmediateActionModel.update({_id : {$in: conflictingImmediateActionIds}}, { e : new Date(nowAsMilliseconds - 1000) }).exec();

            conflictingImmediateActionIndices.forEach(function(indexToRemove, index){
              // since we're removing elements from the target array as we go,
              // the indexToRemove will be off by however many we've removed so far
              indexToRemove -= index;
              immediateActionResults.splice(indexToRemove, 1);
            });
          }

          // ok, now we're clean.
          // replace device.status.immediateActions with the result set
          newDeviceStatus.immediateActions = immediateActionResults;

          if (newDeviceStatus.expires > soonestImmediateActionExpiration){
            newDeviceStatus.expires = soonestImmediateActionExpiration;
          }

          return innerCallback();
        });
      },

      function filterActiveActions(innerCallback){
        var activeActionsByControl = {},
            controlKey,
            activeActions = [];

        newDeviceStatus.actions.forEach(function(action){
          activeActionsByControl[action.control] = action;
        });

        // override with immediateActions
        newDeviceStatus.immediateActions.forEach(function(immediateAction, index){
          activeActionsByControl[immediateAction.action.control] = immediateAction.action;
        });        

        for (controlKey in activeActionsByControl) {
          if (activeActionsByControl.hasOwnProperty(controlKey)) {
            activeActions.push(activeActionsByControl[controlKey]);
          }
        }

        newDeviceStatus.activeActions = activeActions;

        return innerCallback();
      },

      function saveDevice(innerCallback){
        device.status.expires = newDeviceStatus.expires;
        device.status.actions = newDeviceStatus.actions;
        device.status.immediateActions = newDeviceStatus.immediateActions;
        device.status.activeActions = newDeviceStatus.activeActions;
        device.status.lastSent = undefined;
        device.save(innerCallback);
      }
    ],
    function (err, updatedDevice){
      return callback(err, updatedDevice);
    }
  );
});


/**
 * Get the compiled device status response, to be sent to the device when requested at /status
 *
 * @param {function(err, statusResponse)} callback
 *
 */
DeviceSchema.method('getStatusResponse', function(callback) {
  var device = this,
      User = require('./user'),
      UserSchema = User.schema,
      UserModel = User.model,
      DeviceModel = this.model(this.constructor.modelName),
      utils = require('./utils'),
      getObjectId = utils.getObjectId,
      getDocumentIdString = utils.getDocumentIdString,
      now = new Date(),
      nowAsMilliseconds = now.valueOf(),
      deviceOwner,
      statesResponseBody = ''
      statusResponseBody = '';

  async.waterfall(
    [
      function getDeviceOwner(innerCallback){
        if (!device.owner) { 
          deviceOwner = undefined;
          return innerCallback();
        }
        if (device.owner.schema === UserSchema){
          deviceOwner = device.owner;
          return innerCallback();
        }
        UserModel.findById(device.owner).exec(function(err, userResult) {
          if (err) { return innerCallback(err); }
          deviceOwner = userResult;
          return innerCallback();
        });
      },
      function getPopulatedDevice(innerCallback){
        DeviceModel.findById(device._id)
        .populate('activeGrowPlanInstance')
        .populate('status.activeActions')
        .exec(function(err, deviceResult){
          device = deviceResult;
          innerCallback(err);
        });
      },
      function compileStatusBody(innerCallback){
        var stateTemplate = DeviceUtils.stateTemplate,
            activeGrowPlanInstancePhase = device.activeGrowPlanInstance ? device.activeGrowPlanInstance.phases.filter(function(item){ return item.active === true; })[0] : null;
            statesResponseBody = '';

        device.outputMap.forEach(
          function(controlOutputPair){
            
            var controlStateString = stateTemplate.replace(/{outputId}/, controlOutputPair.outputId),
                controlAction = device.status.activeActions.filter(
                  function(action){ 
                    return getObjectId(action.control).equals(controlOutputPair.control);
                  }
                )[0];

            // Need an entry for every output, even if there's no associated cycle
            if (!controlAction){
              // if no action, just 0 everything out
              controlStateString = controlStateString.replace(/{value}/, '0');
            } else {
              controlStateString = controlStateString.replace(/{value}/, ActionModel.getCurrentControlValue(now, activeGrowPlanInstancePhase, controlAction, deviceOwner ? deviceOwner.timezone : ''));
            }
            statesResponseBody += controlStateString;
          }
        );
        
        statusResponseBody += "STATES=" + statesResponseBody;
        
        if (device.status.calibrationMode){
          statusResponseBody += "\nCALIB_MODE=" + device.status.calibrationMode;
        }
        
        statusResponseBody += String.fromCharCode(7);

        return innerCallback(null);
      },

    ],
    function(err){
      return callback(err, statusResponseBody);
    }
  );
});

/**************** END INSTANCE METHODS ****************************/







/**************** STATIC METHODS ****************************/

/**
 * Log a CalibrationStatusLog for the device. 
 * For now used only in the device API when device posts to /status
 * 
 * @param {Device} settings.device
 * @param {CalibrationStatusLog|object} settings.calibrationStatusLog. "device" property shouldn't be set; we'll set it after we grab the device through macAddress
 * @param {CalibrationUtils.CALIB_MODES} settings.calibrationStatusLog.mode
 * @param {CalibrationUtils.CALIB_STATUSES} settings.calibrationStatusLog.status
 * @param {string=} settings.calibrationStatusLog.message. optional.
 * @param {function(err, CalibrationStatusLog)} callback
 */
DeviceSchema.static('logCalibrationStatus', function(settings, callback) {
  var DeviceModel = this,
    CalibrationStatusLogModel = require('./calibrationStatusLog').model;

  settings.calibrationStatusLog.device = settings.device._id;

  CalibrationStatusLogModel.create(settings.calibrationStatusLog, callback);
});
/**************** END STATIC METHODS ****************************/






/***************** MIDDLEWARE **********************/

/**
 *  HACK : if DeviceType is unassigned, assign it the 'Bitponics Beta Device 1' DeviceType
 *  In production, every device produced should actually get a database entry. And maybe
 *  we should have a blank deviceType or something as fallback
 */
DeviceSchema.pre('save', function(next){
  var device = this;
  if(device.deviceType){ return next(); }

  // Bitponics Base Station 1
  DeviceTypeModel.findOne({ _id: "506de2fe8eebf7524342cb37" }, function(err, deviceType){
    if (err) { return next(err); }
    device.deviceType = deviceType;
    next();
  });
});

/**
 *  If sensorMap is undefine
 d then use the deviceType's default sensorMap
 */
DeviceSchema.pre('save', function(next){
  var device = this;
  if(device.sensorMap && device.sensorMap.length){ return next(); }

  DeviceTypeModel.findOne({ _id: device.deviceType }, function(err, deviceType){
    if (err) { return next(err); }
    device.sensorMap = deviceType.sensorMap;
    next();
  });
});

/**
 *  If outputMap is undefined then use the deviceType's default outputMap
 */
DeviceSchema.pre('save', function(next){
  var device = this;
  if(device.outputMap && device.outputMap.length){ return next(); }

  DeviceTypeModel.findOne({ _id: device.deviceType }, function(err, deviceType){
    if (err) { return next(err); }
    device.outputMap = deviceType.outputMap;
    next();
  });
});

/**
 * Remove old recentSensorLogs
 *
DeviceSchema.pre('save', function(next){
  var device = this,
    now = Date.now(),
    cutoff = now - (1000 * 60 * 2), // now - 2 hours
  //cap = 10,
    logsToRemove = [];

  if (!device.recentSensorLogs) { return next(); }

  /*
   while (device.recentSensorLogs.length > cap){
   device.recentSensorLogs.pop();
   }
   *
  
  device.recentSensorLogs.forEach(function(log, index){
    //if (log.ts.valueOf() < cutoff) { logsToRemove.push(log); }
    if (index > 9){
      logsToRemove.push(log);
    }
  });

  logsToRemove.forEach(function(log){
    log.remove();
  });

  next();
});
*/

/***************** END MIDDLEWARE **********************/


exports.schema = DeviceSchema;
exports.model = mongooseConnection.model('Device', DeviceSchema);
exports.utils = DeviceUtils;