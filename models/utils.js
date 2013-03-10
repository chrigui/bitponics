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
      SensorLogModel = require('./sensorLog').model;

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
  
  async.parallel(
    [
    function parallel1(innerCallback){
      if (!device){ return innerCallback(); }
      device.recentSensorLogs.unshift(pendingSensorLog);
      device.save(innerCallback);
    },
    function parallel2(innerCallback){
      if (!growPlanInstance) { return innerCallback();}
      growPlanInstance.recentSensorLogs.unshift(pendingSensorLog);          
      growPlanInstance.save(innerCallback);
    },
    function parallel3(innerCallback){
      var sensorLog = new SensorLogModel(pendingSensorLog);
      sensorLog.save(innerCallback);
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
        
        async.forEach(
          pendingSensorLog.logs, 
          function(log, iteratorCallback){
            var idealRange = phase.idealRanges.filter(function(idealRange){ return idealRange.sCode == log.sCode})[0],
                valueRange,
                message = '';
            if (!idealRange){ return iteratorCallback(); }
            valueRange = idealRange.valueRange;
            if (log.val < valueRange.min) {
              if (!idealRange.checkIfWithinTimespan(timezone, pendingSensorLog.ts)){ return iteratorCallback(); }
              
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
          innerCallback
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
 * Trigger an action override. Can be called because of an IdealRange violation or manually.
 *
 * If there's an associated control for the action, expires the override with the next iteration of an action cycle on the given control.
 *
 * @param options {Object}
 *    {
 *      growPlanInstance : GrowPlanInstanceModel (required),
 *      actionId : ObjectID (required),
 *      device : DeviceModel (optional. Device of GrowPlanInstance),
 *      immediateActionMessage : String,
 *      user : UserModel (required. owner of GrowPlanInstance)
 *    }
 *
 * @param callback
 */
function triggerImmediateAction(options, callback){
  var Device = require('./device'),
    DeviceModel = Device.model,
    DeviceUtils = Device.utils,
    GrowPlanInstanceModel = require('./growPlanInstance').model,
    GrowPlanModel = require('./growPlan').growPlan.model,
    Action = require('./action'),
    ActionModel = Action.model,
    ImmediateActionLogModel = require('./immediateActionLog').model,
    NotificationModel = require('./notification').model,
    SensorLogModel = require('./sensorLog').model,
    EmailConfig = require('../config/email-config'),
    nodemailer = require('nodemailer'),
    winston = require('winston'),
    async = require('async'),
    tz = require('timezone/loaded'),
    i18nKeys = require('../i18n/keys');

  var growPlanInstance = options.growPlanInstance,
      device = options.device, 
      actionId = options.actionId,
      immediateActionMessage = options.immediateActionMessage,
      user = options.user,
      timezone = user.timezone,
      action;

  ActionModel.findById(actionId, function(err, actionResult){
    if (err) { return callback(err);}
    if (!actionResult) { return callback(new Error(i18nKeys.get('Invalid action id')));}

    action = actionResult;
    // calculate when the immediateAction should expire.
    var now = new Date(),
        expires = now + (365 * 24 * 60 * 60 * 1000),
        actionHasDeviceControl = false;

    async.series(
      [
        function(innerCallback){
          if (!action.control){ return innerCallback(); }

          // If we're here, action does have a control

          if (!device){
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
                  expires = now.valueOf() + cycleRemainder;
                  return innerCallback();  
                });
                
              }
            );
            
          } else {
            // get any other actions that exist for the same control.
            var growPlanInstancePhase = growPlanInstance.phases.filter(function(phase) { return phase.active;})[0];
            
            ActionModel.findOne()
            .where('_id')
            .in(device.activeActions.actions)
            .where('control')
            .equals(action.control)
            .exec(function(err, actionResult){
              if (err) { return innerCallback(err);}
              if (!actionResult){ return innerCallback(); }
              var cycleRemainder = ActionModel.getCycleRemainder(now, growPlanInstancePhase, actionResult, timezone);
              expires = now.valueOf() + cycleRemainder;
              actionHasDeviceControl = true;
              return innerCallback();  
            });
          }
        }
      ],
      function(err, result){
        if (err) { return callback(err); }
        
        var notificationType,
            notificationMessage = immediateActionMessage + '. ';

        winston.info('Logging immediateAction for ' + growPlanInstance._id + ' "' + immediateActionMessage + '", action ' + action._id);
        
        if (!actionHasDeviceControl){ 
          notificationType = 'actionNeeded';
          notificationMessage += action.description;
        } else {
          notificationType = 'info';
          notificationMessage += i18nKeys.get('device action trigger message', action.description);
        }

        // In parallel: 
        // log to ImmediateActionLog
        // log a Notification, and 
        // if device has a relevant control, refresh its commands
        async.parallel(
          [
            function(innerCallback){
              var actionLog = new ImmediateActionLogModel({
                  gpi : growPlanInstance._id,
                  message : immediateActionMessage,
                  timeRequested : now,
                  action : action,
                  // TODO : handle expires for the no-device case 
                  expires : expires
                });

              // push the log to ImmediateActionLogModel
              actionLog.save(innerCallback);
            },
            function(innerCallback){
              var notification = new NotificationModel({
                  users : [user],
                  gpi : growPlanInstance,
                  timeToSend : now,
                  msg : notificationMessage,
                  type : notificationType
              });
              winston.info('Creating notification : ' + notification.toString());
              notification.save(function(err){
                if (err) { return innerCallback(err); }
                return innerCallback();
              });
            },
            function(innerCallback){
              if (actionHasDeviceControl){ 
                winston.info('Calling refreshActiveImmediateActions for device : ' + device._id.toString());
                return device.refreshActiveImmediateActions(innerCallback);
              } 
              return innerCallback();
            }
          ],
          function(err){
            if (err) { return callback(err); }
            return callback();
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
      tomorrow = new Date(now + (24 * 60 * 60 * 1000));

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

  var now = new Date();
  NotificationModel
  .find()
  .where('timeToSend')
  .lte(now)
  .populate('users', 'email') // only need the email field for Users
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
            text: notification.msg,
            html: notification.msg
        };
        
        emailTransport.sendMail(mailOptions, function(err, response){
          if(err){ return iteratorCallback(err); }
          
          notification.sentLogs.push({ts: now});
          
          if (notification.repeat && notification.repeat.duration){
            notification.timeToSend = tz(notification.timeToSend, notification.tz, notification.repeat.tz, '+' + notification.repeat.duration + ' ' + notification.repeat.repeatType);
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
  // else, assume it's a populated model and return _id property
  return object._id;
}


/**
 * Retrieves a GrowPlan and populates all of its nested objects:
 * phases.nutrients
 * phases.growSystem
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
      }
    ],
    function (err, result) {
      //console.log(JSON.stringify(growPlans, null, 2));
      return callback(err, growPlans);
    }
  );
}

module.exports = {
  logSensorLog : logSensorLog,
  triggerImmediateAction : triggerImmediateAction,
  scanForPhaseChanges : scanForPhaseChanges,
  clearPendingNotifications : clearPendingNotifications,
  getObjectId : getObjectId,
  getFullyPopulatedGrowPlan : getFullyPopulatedGrowPlan
};