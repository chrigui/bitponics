/**
 * logSensorLog : Log a sensorLog to the sensorLog collection as well as the
 * device.recentSensorLogs & growPlanInstance.recentSensorLogs. Verify against
 * IdealRanges and trigger Actions if necessary.
 *
 * @param options.pendingSensorLog {Object} : object in a format matching SensorLogSchema. gpid is optional, and if omitted, the log will only be logged to 
 *      the device's recentSensorLogs
 * @param options.growPlanInstance {GrowPlan}: optional. GrowPlanInstance model instance on which to log this to recentSensorLogs. Optional since we may want to log logs for a device during device setup, before there's been a GPI pairing.
 * @param options.device {Device} : optional. Device Model instance on which to log this to recentSensorLogs
 */
function logSensorLog(options, callback){
  var GrowPlanModel = require('./growPlan').growPlan.model,
      async = require('async'),
      SensorLogModel = require('./sensorLog').model,
      requirejs = require('../lib/requirejs-wrapper'),
      feBeUtils = requirejs('fe-be-utils');

  var pendingSensorLog = options.pendingSensorLog,
      growPlanInstance = options.growPlanInstance,
      device = options.device,
      user = options.user,
      timezone = user.timezone,
      activeGrowPlanInstancePhase;

  if (growPlanInstance){
    activeGrowPlanInstancePhase = growPlanInstance.phases.filter(function(phase){ return phase.active; })[0];
    pendingSensorLog.gpi = growPlanInstance._id;
  }

  if (!(pendingSensorLog instanceof SensorLogModel)) {
    pendingSensorLog = new SensorLogModel(pendingSensorLog);
  }

  if (!pendingSensorLog.ts){
    pendingSensorLog.ts = new Date();
  }
  
  async.parallel(
    [
    function parallel1(innerCallback){
      if (!device){ return innerCallback(); }
      // for some goddamn mysterious reason, unshift is causing pendingSensorLog.logs to 
      // be an empty array when persisted to device.recentSensorLogs. 
      // Only push is getting the whole thing in. Gotta
      // abandon desc-sorted recentSensorLogs for now because of that
      device.recentSensorLogs.push(pendingSensorLog);
      device.save(innerCallback);
    },
    function parallel2(innerCallback){
      if (!growPlanInstance) { return innerCallback();}
      growPlanInstance.recentSensorLogs.push(pendingSensorLog);          
      growPlanInstance.save(innerCallback);
    },
    function parallel3(innerCallback){
      pendingSensorLog.save(innerCallback);
    },
    function parallel4(innerCallback){
      if (!growPlanInstance) { return innerCallback();}
      GrowPlanModel
      .findById(growPlanInstance.growPlan)
      .exec(function(err, growPlan){
        if (err){ return innerCallback(err); }
        if (!growPlan){ return new Error('GrowPlanInstance.growPlan not found'); }
        
        var phase = growPlan.phases.filter(function(item){ return item._id.equals(activeGrowPlanInstancePhase.phase); })[0];
        if (!phase){ return new Error('Active phase not found for this grow plan instance'); }
        if (!phase.idealRanges){ return innerCallback();}
        

        var phaseDaySummary = {
          status : feBeUtils.PHASE_DAY_SUMMARY_STATUSES.GOOD,
          sensorSummaries : {}
        };

        async.forEach(
          pendingSensorLog.logs, 
          function(log, iteratorCallback){
            var idealRange = phase.idealRanges.filter(function(idealRange){ return idealRange.sCode == log.sCode})[0],
                valueRange,
                message = '';

            phaseDaySummary.sensorSummaries[log.sCode] = feBeUtils.PHASE_DAY_SUMMARY_STATUSES.GOOD;

            if (!idealRange){ return iteratorCallback(); }
            
            valueRange = idealRange.valueRange;
            
            if (log.val < valueRange.min) {
              if (!idealRange.checkIfWithinTimespan(timezone, pendingSensorLog.ts)){ return iteratorCallback(); }
              
              phaseDaySummary.sensorSummaries[log.sCode] = feBeUtils.PHASE_DAY_SUMMARY_STATUSES.BAD;
              phaseDaySummary.status = feBeUtils.PHASE_DAY_SUMMARY_STATUSES.BAD;

              // TODO : replace log.sCode with the sensor name
              message = log.sCode + ' is below recommended minimum of ' + valueRange.min;
              
              triggerImmediateAction(
                {
                  growPlanInstance : growPlanInstance, 
                  device : device, 
                  actionId : idealRange.actionBelowMin, 
                  immediateActionMessage : message, 
                  user : user 
                },
                function(err){
                  if (err) { return iteratorCallback(err); }
                  iteratorCallback();
                }
              );
            } else if (log.val > valueRange.max){
              if (!idealRange.checkIfWithinTimespan(timezone, pendingSensorLog.ts)){ return iteratorCallback(); }
              
              phaseDaySummary.sensorSummaries[log.sCode] = feBeUtils.PHASE_DAY_SUMMARY_STATUSES.BAD;
              phaseDaySummary.status = feBeUtils.PHASE_DAY_SUMMARY_STATUSES.BAD;
              
              message = log.sCode + ' is above recommended maximum of ' + valueRange.max;
              
              triggerImmediateAction(
                {
                  growPlanInstance : growPlanInstance, 
                  device : device, 
                  actionId : idealRange.actionBelowMin, 
                  immediateActionMessage : message, 
                  user : user 
                },
                function(err){
                  if (err) { return iteratorCallback(err); }
                  iteratorCallback();
                }
              );
            } else { 
              return iteratorCallback(); 
            }
          },
          function(err){
            if (err) { return innerCallback(err);}

            growPlanInstance.mergePhaseDaySummary(
              {
                growPlanInstancePhase : activeGrowPlanInstancePhase,
                date : pendingSensorLog.ts,
                daySummary : phaseDaySummary
              },
              innerCallback
            );
          }
        );
      });
    }
    ], 
    function parallelFinal(err, result){
      return callback(err);
    }
  );
}


/**
 * Trigger an immediate action. Can be called manually or because of an IdealRange violation.
 *
 * If there's an associated control for the action, expires the override with the next iteration of an action cycle on the given control.
 *
 * @param {object} options  
 * @param {GrowPlanInstance} options.growPlanInstance : GrowPlanInstanceModel 
 * @param {ObjectId|string} options.actionId : ObjectID 
 * @param {Device=} options.device : optional. Device of GrowPlanInstance. Should be full DeviceModel doc, not just an ObjectId
 * @param {string} options.immediateActionMessage : message to log with the immediateAction
 * @param {User} options.user : required. owner of GrowPlanInstance
 * @param {function(err, {{immediateAction: ImmediateAction, notification : Notification }} )} callback 
 */
function triggerImmediateAction(options, callback){
  var Device = require('./device'),
    DeviceModel = Device.model,
    DeviceUtils = Device.utils,
    GrowPlanInstanceModel = require('./growPlanInstance').model,
    GrowPlanModel = require('./growPlan').growPlan.model,
    Action = require('./action'),
    ActionModel = Action.model,
    ImmediateActionModel = require('./immediateAction').model,
    NotificationModel = require('./notification').model,
    SensorLogModel = require('./sensorLog').model,
    EmailConfig = require('../config/email-config'),
    nodemailer = require('nodemailer'),
    winston = require('winston'),
    async = require('async'),
    tz = require('timezone/loaded'),
    i18nKeys = require('../i18n/keys'),
    requirejs = require('../lib/requirejs-wrapper'),
    feBeUtils = requirejs('fe-be-utils');

  var growPlanInstance = options.growPlanInstance,
      device = options.device, 
      actionId = options.actionId,
      immediateActionMessage = options.immediateActionMessage,
      user = options.user,
      timezone = user.timezone,
      action;

  if (growPlanInstance.device && !device){ return callback(new Error('If a GrowPlanInstance has a device, Device document must be passed into triggerImmediateAction'))}

  ActionModel.findById(actionId, function(err, actionResult){
    if (err) { return callback(err);}
    if (!actionResult) { return callback(new Error(i18nKeys.get('Invalid action id')));}

    action = actionResult;

    // calculate when the immediateAction should expire.
    var now = new Date(),
        nowAsMilliseconds = now.valueOf(),
        expires = nowAsMilliseconds + (365 * 24 * 60 * 60 * 1000),
        actionHasDeviceControl = false;

    async.series(
      [
        function(innerCallback){
          if (!action.control){ return innerCallback(); }

          // If we're here, action does have a control

          if (device){
            // get any other phase actions that exist for the same control.
            var growPlanInstancePhase = growPlanInstance.phases.filter(function(phase) { return phase.active;})[0];
            
            actionHasDeviceControl = device.outputMap.some(
              function(outputMapItem){
                return getObjectId(outputMapItem.control).equals(getObjectId(action.control));
              }
            );
        
            // Expire the immediateAction on the next cycle of a baseline phase action
            ActionModel.findOne()
            .where('_id')
            .in(device.status.actions)
            .where('control')
            .equals(action.control)
            .exec(function(err, actionResult){
              if (err) { return innerCallback(err);}
              if (!actionResult){ return innerCallback(); }
              var cycleRemainder = ActionModel.getCycleRemainder(now, growPlanInstancePhase, actionResult, timezone);
              expires = nowAsMilliseconds + cycleRemainder;
              return innerCallback();  
            });

          } else {
            GrowPlanModel.findById(growPlanInstance.growPlan)
            .populate('phases.actions')
            .exec(function(err, growPlan){
                if (err) { return innerCallback(err);}
                var growPlanInstancePhase = growPlanInstance.phases.filter(function(phase){return phase.active;})[0];
                var phase = growPlan.phases.filter(function(phase){return phase._id.equals(growPlanInstancePhase.phase);})[0];
                ActionModel.findOne()
                .where('_id')
                .in(phase.actions)
                .where('control')
                .equals(action.control)
                .exec(function(err, actionResult){
                  if (err) { return innerCallback(err);}
                  if (!actionResult){ return innerCallback(); }
                  var cycleRemainder = ActionModel.getCycleRemainder(now, growPlanInstancePhase, actionResult, timezone);
                  expires = nowAsMilliseconds + cycleRemainder;
                  return innerCallback();  
                });
              }
            );            
          }
        }
      ],
      function(err, result){
        if (err) { return callback(err); }
        
        var notificationType,
            notificationMessage;

        winston.info('Logging immediateAction for gpi ' + growPlanInstance._id + ' "' + immediateActionMessage + '", action ' + action._id);
        
        if (!actionHasDeviceControl){ 
          notificationType = feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED;
          notificationMessage = i18nKeys.get('manual action trigger message', immediateActionMessage, action.description);
        } else {
          notificationType = feBeUtils.NOTIFICATION_TYPES.INFO;
          notificationMessage = i18nKeys.get('device action trigger message', immediateActionMessage, action.description);
        }

        // In parallel: 
        // log to ImmediateAction
        // log a Notification, and 
        // if device has a relevant control, refresh its commands
        async.parallel(
          [
            function(innerCallback){
              var immediateAction = new ImmediateActionModel({
                  gpi : growPlanInstance._id,
                  message : immediateActionMessage,
                  timeRequested : now,
                  action : action,
                  // TODO : handle expires for the no-device case 
                  expires : expires
                });

              // push the log to ImmediateActionModel
              immediateAction.save(innerCallback);
            },
            function(innerCallback){
              var notification = new NotificationModel({
                  users : [user],
                  growPlanInstance : growPlanInstance,
                  timeToSend : now,
                  message : notificationMessage,
                  type : notificationType
              });
              winston.info('Creating notification : ' + notification.toString());
              notification.save(innerCallback);
            },
            function(innerCallback){
              if (actionHasDeviceControl){ 
                winston.info('Calling refreshStatus for device : ' + device._id.toString());
                return device.refreshStatus(innerCallback);
              } 
              return innerCallback();
            }
          ],
          function(err, results){
            if (err) { return callback(err); }
            var data = {
              immediateAction : results[0][0],
              notification : results[1][0]
            }
            return callback(null, data);
          }
        );
      }
    );
  });
};



function scanForPhaseChanges(GrowPlanInstanceModel, callback){
  var GrowPlanInstanceModel = require('./growPlanInstance').model,
      NotificationModel = require('./notification').model,
      winston = require('winston');

  var now = new Date(),
      nowAsMilliseconds = now.valueOf(),
      tomorrow = new Date(nowAsMilliseconds + (24 * 60 * 60 * 1000));

    GrowPlanInstanceModel
    .find()
    .where('active')
    .equals(true)
    .where('phases.expectedEndDate')
    .gt(now).lt(tomorrow)
    .populate('growPlan')
    .select('_id users growPlan phases')
    .exec(function(err, growPlanInstanceResults){
      // TODO : log to winston/loggly
      if (err) { console.log( err ); return; }
      if (!growPlanInstanceResults.length) { return; }

      growPlanInstanceResults.forEach(function(growPlanInstance){
        var currentGrowPlanInstancePhase,
          currentGrowPlanInstancePhaseIndex, 
          nextGrowPlanInstancePhase,
          nextPhase,
          notificationType = 'info',
          notificationMessage = '',
          notification;

        growPlanInstance.phases.some(
          function(item, index){ 
            if (item.active === true){
              currentGrowPlanInstancePhase = item;
              currentGrowPlanInstancePhaseIndex = index;
              return true;
            }
          }
      );
      
      nextGrowPlanInstancePhase = growPlanInstance.phases[currentGrowPlanInstancePhaseIndex + 1];

      if (!nextGrowPlanInstancePhase) { return; }
      
      growPlanInstance.growPlan.phases.some(function(item){
        if (item._id.equals(nextGrowPlanInstancePhase.phase)){
          nextPhase = item;
          return true;
        }
      });

      notificationMessage = "It's almost time for the " + nextPhase.name + " phase. Log into your dashboard to advance your grow plan to the next phase.";
      notification = new NotificationModel({
        gpi : growPlanInstance._id,
        users : growPlanInstance.users,
        type : notificationType,
        timeToSend : now,
        msg : notificationMessage
      });
      notification.save();  
      });
    });
}

/** 
 * Called from the worker process across each environment, which is why we
 * need the model to be passed in.
 *
 * Gets Notifications with "timeToSend" in the past, sends them, then resets "timeToSend"
 */
function clearPendingNotifications (NotificationModel, callback){
  var NotificationModel = require('./notification').model,
      EmailConfig = require('../config/email-config'),
      nodemailer = require('nodemailer'),
      tz = require('timezone/loaded'),
      async = require('async'),
      winston = require('winston');

  var now = new Date(),
      nowAsMilliseconds = now.valueOf();
  NotificationModel
  .find()
  .where('tts')
  .lte(now)
  .populate('u', 'email') // only need the email field for Users
  .exec(function(err, notificationResults){
    if (err) { return callback(err); }
    if (!notificationResults.length){ return callback(); }
    var emailTransport = nodemailer.createTransport("SES", EmailConfig.amazonSES.api);
    
    async.forEach(
      notificationResults, 
      function (notification, iteratorCallback){
        var subject = "Bitponics Notification";
        if (notification.type === 'actionNeeded'){ subject += ': Action Needed'; }
        
        var mailOptions = {
            from: "notifications@bitponics.com", // sender address
            to: notification.users.map(function(user) { return user.email; }).join(', '), 
            subject: subject, // Subject line
            text: notification.message,
            html: notification.message
        };
        
        emailTransport.sendMail(mailOptions, function(err, response){
          if(err){ return iteratorCallback(err); }
          
          notification.sentLogs.push({ts: now});
          
          if (notification.repeat && notification.repeat.duration){
            notification.timeToSend = tz(notification.timeToSend, notification.timezone, notification.repeat.timezone, '+' + notification.repeat.duration + ' ' + notification.repeat.repeatType);
          } else {
            notification.timeToSend = null;
          }
          
          notification.save(iteratorCallback);
        });
      },
      function (err){
        if (err) { return callback(err);}
      }
    );
  });
}

/**
 * Returns the ObjectId of the object, taking into account
 * whether the object is a populated Model or an ObjectId
 *
 * @param object
 * @return ObjectId
 */
function getObjectId (object){
  var ObjectID = require('mongodb').ObjectID;
  var constructor = object.constructor.name.toLowerCase();
  if (constructor === 'objectid'){ return object; }
  if (constructor === 'string'){ return new ObjectID(object); } 
  // else, assume it's a populated model and has an _id property
  var _idConstructor = object._id.constructor.name.toLowerCase();
  if (_idConstructor === 'objectid') { return object._id; } 
  // might be a POJO so coerce it to an ObjectID object
  return new ObjectID(object._id.toString());
}


/**
 * Retrieves a GrowPlan and populates all of its nested objects:
 * plants
 * phases.nutrients
 * phases.growSystem
 * phases.light
 * phases.light.fixture
 * phases.light.bulb
 * phases.actions
 * phases.phaseEndActions
 * phases.idealRanges.sensor
 * phases.idealRanges.actionBelowMin
 * phases.idealRanges.actionAboveMax
 *
 * Returns a plain-old-JS-object GrowPlan (not a GrowPlan Mongoose model) 
 * because of the lack of support for assigning models to ObjectId reference fields
 * 
 * Omits GrowPlan.sensors and GrowPlan.controls properties as those will be converted 
 * into virtuals soon (they'll simply be compiled views of all the sensors & controls used across all phases)
 * 
 * @param query {Object} Mongoose query parameters.
 * @param callback {function} Function with the signature function(err, growPlan){}. "growPlan" param is a POJO GrowPlan.
 */
function getFullyPopulatedGrowPlan(query, callback){
  var GrowPlanModel = require('./growPlan').growPlan.model,
      async = require('async'),
      winston = require('winston'),
      Action = require('./action'),
      ActionModel = Action.model,
      LightModel = require('./light').model,
      LightBulbModel = require('./lightBulb').model,
      LightFixtureModel = require('./lightFixture').model,
      growPlans;
      
  async.series(
    [
      function (innerCallback) {
        GrowPlanModel.find(query)
        .populate('plants')
        .populate('phases.nutrients')
        .populate('phases.growSystem')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.light')
        .exec(function(err, growPlanResults){
          growPlans = growPlanResults.map(function(growPlanResult){ return growPlanResult.toObject(); });
          innerCallback();
        });
      },
      function (innerCallback) {
        var actionIds = [];
        growPlans.forEach(function(growPlan) {
          growPlan.phases.forEach(function(phase) {
            phase.idealRanges.forEach(function(idealRange, i) {
              actionIds.push(idealRange.actionAboveMax);
              actionIds.push(idealRange.actionBelowMin);
            });
          });
        });
        
        ActionModel.find({})
        .where('_id').in(actionIds)
        .exec(function (err, actions) {
          if (err) { return innerCallback(err); }
          
          var actionsById = {};
          actions.forEach(function(item, index) {
             actionsById[item._id.toString()] = item;
          });

          growPlans.forEach(function(growPlan) {
            growPlan.phases.forEach(function(phase) {
              phase.idealRanges.forEach(function(idealRange, i) {
                if (idealRange.actionBelowMin) { 
                  idealRange.actionBelowMin = actionsById[getObjectId(idealRange.actionBelowMin).toString()];
                }
                if (idealRange.actionAboveMax) { 
                  idealRange.actionAboveMax = actionsById[getObjectId(idealRange.actionAboveMax).toString()];
                }
              });
            });
          });

          innerCallback();
        });
      },

      function populateLights(innerCallback){
        var lightFixtureIds = [];
        var lightBulbIds = [];
        growPlans.forEach(function(growPlan) {
          growPlan.phases.forEach(function(phase) {
            if (phase.light){
              if (phase.light.fixture){
                lightFixtureIds.push(getObjectId(phase.light.fixture));
              }
              if (phase.light.bulb){
                lightBulbIds.push(getObjectId(phase.light.bulb));
              }
            }
          });
        });

        async.parallel(
          [
            function loadLightFixtures(innerInnerCallback){
              LightFixtureModel.find({})
              .where('_id').in(lightFixtureIds)
              .exec(function (err, lightFixtures) {
                if (err) { return innerCallback(err); }
                
                var lightFixturesById = {};
                lightFixtures.forEach(function(item, index) {
                   lightFixturesById[item._id.toString()] = item;
                });

                growPlans.forEach(function(growPlan) {
                  growPlan.phases.forEach(function(phase) {
                    if (phase.light && phase.light.fixture){
                      phase.light.fixture = lightFixturesById[getObjectId(phase.light.fixture).toString()];
                    }
                  });
                });

                return innerInnerCallback();
              });
            },

            function loadLightBulbs(innerInnerCallback){
              LightBulbModel.find({})
              .where('_id').in(lightBulbIds)
              .exec(function (err, lightBulbs) {
                if (err) { return innerCallback(err); }
                
                var lightBulbsById = {};
                lightBulbs.forEach(function(item, index) {
                   lightBulbsById[item._id.toString()] = item;
                });

                growPlans.forEach(function(growPlan) {
                  growPlan.phases.forEach(function(phase) {
                    if (phase.light && phase.light.bulb){
                      phase.light.bulb = lightBulbsById[getObjectId(phase.light.bulb).toString()];
                    }
                  });
                });

                return innerInnerCallback();
              });
            }
          ],
          function lightParallelEnd(err, results){
            innerCallback();
          }
        );
        
      }
    ],
    function (err, result) {
      //console.log(JSON.stringify(growPlans, null, 2));
      return callback(err, growPlans);
    }
  );
}


/**
 * Assigns a User to a Device as an owner.
 * Pairs by assigning user to device.owner and assigning deviceId to a User.deviceKey
 *
 * Designed to be called by /setup route. Assumes that the setup page echoed the available deviceKey
 * that was created or retrieved on pageload of /setup
 * 
 * @param {object} settings
 * @param {string} settings.deviceMacAddress - macAddress as sent by the device.
 * @param {string} settings.publicDeviceKey : User.deviceKeys.public string to use to select which key to assign to the device.
 * @param {User} settings.user
 * @param {function(err, {device: Device, user: User})} callback 
 */
function assignDeviceToUser(settings, callback){
  var Device = require('./device'),
      DeviceModel = Device.model,
      DeviceUtils = Device.utils,
      async = require('async'),
      winston = require('winston'),
      UserModel = require('./user').model,
      deviceMacAddress = settings.deviceMacAddress,
      publicDeviceKey = settings.publicDeviceKey,
      user = settings.user,
      i18nKeys = require('../i18n/keys'),
      device;

  async.series(
    [
      function deviceStep(innerCallback){
        DeviceModel.findOne({ macAddress: deviceMacAddress },
          function(err, deviceResult){
            if (err) { return callback(err);}
            if (deviceResult){
              device = deviceResult;
            } else {
              // TODO : this scenario shouldn't occur in production; we should create Device model instances
              // at production time.
              device = new DeviceModel({
                macAddrress : deviceMacAddress
                // will get a default deviceType based on Device middleware
              });
            }

            device.userAssignmentLogs = device.userAssignmentLogs || [];
            device.userAssignmentLogs.push({
              ts: new Date(),
              user : user,
              assignmentType : DeviceUtils.ROLES.OWNER
            });
            device.owner = user;

            device.save(innerCallback)
          }
        );
      },
      function userStep(innerCallback){
        var deviceKey = user.deviceKeys.filter(function(deviceKey){
          return deviceKey.public === publicDeviceKey;
        })[0];
        if (!deviceKey || deviceKey.deviceId){ 
          return innerCallback(
            new Error(i18nKeys.get("unavailable device key", publicDeviceKey))
          );
        }

        deviceKey.deviceId = device._id;

        user.save(innerCallback);
      }
    ],
    function(err, results){
      if (err) { return callback(err); }
      var data = {
        device : results[0][0],
        user : results[1][0]
      }
      return callback(null, data);
    }
  );
}


module.exports = {
  logSensorLog : logSensorLog,
  triggerImmediateAction : triggerImmediateAction,
  scanForPhaseChanges : scanForPhaseChanges,
  clearPendingNotifications : clearPendingNotifications,
  getObjectId : getObjectId,
  getFullyPopulatedGrowPlan : getFullyPopulatedGrowPlan,
  assignDeviceToUser : assignDeviceToUser
};