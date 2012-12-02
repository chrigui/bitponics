var Device = require('./device'),
    DeviceModel = Device.model,
    DeviceUtils = Device.utils,
    GrowPlanInstanceModel = require('./growPlanInstance').model,
    GrowPlanModel = require('./growPlan').growPlan.model,
    Action = require('./action'),
    ActionModel = Action.model,
    ActionUtils = Action.utils,
    ActionOverrideLogModel = require('./actionOverrideLog').model,
    NotificationModel = require('./notification').model,
    SensorModel = require('./sensor').model,
    SensorLogModel = require('./sensorLog').model,
    EmailConfig = require('../config/email-config'),
    nodemailer = require('nodemailer'),
    winston = require('winston'),
    async = require('async'),
    tz = require('timezone/loaded'),
    ObjectID = require('mongodb').ObjectID;


/**
 * logSensorLog : Log a sensorLog to the sensorLog collection as well as the
 * device.recentSensorLogs & growPlanInstance.recentSensorLogs. Verify against
 * IdealRanges and trigger Actions if necessary.
 *
 * @param pendingSensorLog : object in a format matching SensorLogSchema. gpid is optional, and if omitted, the log will only be logged to 
 *      the device's recentSensorLogs
 * @param growPlanInstance : GrowPlanInstance model instance on which to log this to recentSensorLogs
 * @param device : optional. Device Model instance on which to log this to recentSensorLogs
 */
function logSensorLog(options, callback){
  var pendingSensorLog = options.pendingSensorLog,
      growPlanInstance = options.growPlanInstance,
      device = options.device,
      user = options.user,
      timezone = user.timezone,
      activeGrowPlanInstancePhase = growPlanInstance.phases.filter(function(phase){ return phase.active; })[0];
  
  pendingSensorLog.gpi = growPlanInstance._id;
  
  async.parallel(
    [
    function parallel1(innerCallback){
      if (!device){ return innerCallback(); }
      device.recentSensorLogs.push(pendingSensorLog);
      device.save(innerCallback);
    },
    function parallel2(innerCallback){
      growPlanInstance.recentSensorLogs.push(pendingSensorLog);          
      growPlanInstance.save(innerCallback);
    },
    function parallel3(innerCallback){
      var sensorLog = new SensorLogModel(pendingSensorLog);
      sensorLog.save(innerCallback);
    },
    function parallel4(innerCallback){
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
              triggerActionOverride(
                {
                  growPlanInstance : growPlanInstance, 
                  device : device, 
                  actionId : idealRange.actionBelowMin, 
                  actionOverrideMessage : message, 
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
              triggerActionOverride(
                {
                  growPlanInstance : growPlanInstance, 
                  device : device, 
                  actionId : idealRange.actionBelowMin, 
                  actionOverrideMessage : message, 
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
      if (err) { return callback(err); }
      return callback();
    }
  );
};


/**
 * Trigger an action override. Can be called because of an IdealRange violation or manually.
 *
 * If there's an associated control for the action, expires the override with the next iteration of an action cycle on the given control. 
 */
function triggerActionOverride(options, callback){
  var growPlanInstance = options.growPlanInstance,
      device = options.device, 
      actionId = options.actionId,
      actionOverrideMessage = options.actionOverrideMessage,
      user = options.user,
      timezone = user.timezone,
      action;

  ActionModel.findById(actionId, function(err, actionResult){
    if (err) { return next(err);}
    if (!actionResult) { return next(new Error('Invalid action id'));}

    action = actionResult;
    // calculate when the actionOverride should expire.
    var now = new Date(),
        expires = now + (365 * 24 * 60 * 60 * 1000),
        actionHasDeviceControl = false;

    async.series(
      [
        function(innerCallback){
          if (!action.control){ return innerCallback(); }

          if (!device){
            GrowPlanModel.findById(growPlanInstance.growPlan)
            .populate('phases.actions')
            .exec(function(err, phaseResult){
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
                  var cycleRemainder = ActionUtils.getCycleRemainder(growPlanInstancePhase, actionResult, timezone);      
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
              var cycleRemainder = ActionUtils.getCycleRemainder(growPlanInstancePhase, actionResult, timezone);      
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
            notificationMessage = actionOverrideMessage + '. ';

        winston.info('Logging actionOverride for ' + growPlanInstance._id + ' "' + actionOverrideMessage + '", action ' + action._id);
        
        if (!actionHasDeviceControl){ 
          notificationType = 'actionNeeded';
          notificationMessage += action.description;
        } else {
          notificationType = 'info';
          notificationMessage += 'Device has automatically triggered the following action : "' + action.description + '".';
        }

        // In parallel: 
        // log to ActionOverrideLog
        // log a Notification, and 
        // if device has a relevant control, refresh its commands
        async.parallel(
          [
            function(innerCallback){
              var actionLog = new ActionOverrideLogModel({
                  gpi : growPlanInstance._id,
                  msg : actionOverrideMessage,
                  timeRequested : now,
                  action : action,
                  // TODO : handle expires for the no-device case 
                  expires : expires
                });

              // push the log to ActionOverrideLogModel
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
                winston.info('Calling refreshActiveActionsOverride for device : ' + device._id.toString());
                return device.refreshActiveActionsOverride(innerCallback);
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
 * need the model to be passed in
 */
function clearPendingNotifications (NotificationModel, callback){
  var now = new Date();
  NotificationModel
  .find()
  .where('timeToSend')
  .lte(now)
  .populate('users', 'email')
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
  var constructor = object.constructor.name.toLowerCase();
  if (constructor === 'objectid'){ return object; }
  if (constructor === 'string'){ return new ObjectID(object); } 
  return object._id;
}

module.exports = {
  logSensorLog : logSensorLog,
  triggerActionOverride : triggerActionOverride,
  scanForPhaseChanges : scanForPhaseChanges,
  clearPendingNotifications : clearPendingNotifications,
  getObjectId : getObjectId
};