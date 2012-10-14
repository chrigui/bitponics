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
    async = require('async');


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
 * Activate an existing grow plan instance. If there's a device, update the device's activeGrowPlanInstance property
 * and remove the device from any other GPI's that are using it. 
 */
function activateGrowPlanInstance(growPlanInstance, callback){
  growPlanInstance.active = true;

  if (!growPlanInstance.device){
    return growPlanInstance.save(callback);
  }
  else {
    DeviceModel.findById(growPlanInstance.device, function(err, deviceResult){
      if (err) { return callback(err); }
      if (!deviceResult){ return callback(new Error('No device found for specified id')); }

      deviceResult.activeGrowPlanInstance = growPlanInstance;

      deviceResult.save(function(err){
        if (err) { return callback(err); }
        return growPlanInstance.save(callback);     
      });
    });

    // TODO : check for other Devices that have activeGrowPlanInstance set to this. do something....
  }
};


/**
 * Activate a phase on a grow plan instance. 
 * @param device : if growPlanInstance has a device, should be the Device model instance. this is just to save us another query here
 */
function activatePhase(growPlanInstance, growPlan, phaseId, device, callback){
  var now = new Date(),
      growPlanPhase = growPlan.phases.filter(function(item){ return item._id.equals(phaseId);})[0],
      deviceControlsWithAction = [];
  
  growPlanInstance.phases.forEach(function(phase){
    if (phase.phase.equals(phaseId)){
      phase.active = true;
      phase.startDate = now; 
      phase.expectedEndDate = now + (growPlanPhase.expectedNumberOfDays * 24 * 60 * 60 * 1000);
    } else {
      if (phase.active == true){
        phase.endDate = now;
      }
      phase.active = false;
    }
  });
  
  if (device){
    deviceControlsWithAction = growPlanPhase.actions.filter(
      function(item){ 
        return (item.control && device.controlMap.some(function(controlPair){ return item.control.equals(controlPair.control);})); 
      }
    );;
  }

  async.parallel([
      // save the new phase settings to the growPlanInstance
      function(innerCallback){
        return growPlanInstance.save(innerCallback);
      },
      // Get all actions for this phase, notify user about them
      function(innerCallback){
        ActionModel
        .find()
        .where('_id')
        .in(growPlanPhase.actions)
        .populate('control')
        .exec(function(err, actionResults){
          if (err) { return innerCallback(err); }
          if (!actionResults.length) { return innerCallback(); }
          
          async.forEach(
            actionResults, 
            function(action, iteratorCallback){
              var notificationMessage = growPlanPhase.name + ' phase started. Time to trigger the action "' + action.description + '".',
                notificationType = 'actionNeeded';

                // Check if this has a device control
                if (action.control) {
                  if (deviceControlsWithAction.some(function(deviceControlId){
                      return action.control._id.equals(deviceControlId);
                    })){
                      notificationType = 'info';
                      notificationMessage += ' Since you have a ' + action.control.name + ' connected, we\'ve done this automatically.';
                    }  
                }
                
                var notification = new NotificationModel({
                  users : growPlanInstance.users,
                  gpi : growPlanInstance,
                  type : notificationType,
                  msg : notificationMessage
                });
                notification.save(iteratorCallback);
              },
              function(err){
                if (err) { return innerCallback(err); }
                innerCallback();
              }
          );
        });
      },
      // Force the device to refresh itself by expiring actions & overrides
      function(innerCallback){
        if (!device){ return innerCallback; }
          
        device.activeActions.expires = now - 1000;
        device.activeActionsOverride.expires = now - 1000;

        ActionOverrideLogModel
        .find()
        .where('gpi')
        .equals(growPlanInstance._id)
        .where(expires)
        .gt(now)
        .populate('action')
        .exec(function(err, actionOverrideLogResults){
          if (err) { return innerCallback(err);}
          if (!actionOverrideLogResults.length){ return innerCallback(); }
          var actionOverrideLogsToExpire = [];
          actionOverrideLogResults.forEach(function(actionOverrideLog){
            if (!actionOverrideLog.action.control) { return; } 
            if (deviceControlsWithAction.some(function(deviceControlId){
              return actionOverrideLog.action.control.equals(deviceControlId);
            })){
              actionOverrideLogsToExpire.push(actionOverrideLog);
            } 
          });

          async.forEach(actionOverrideLogsToExpire, 
            function(actionOverrideLog, iteratorCallback){
              actionOverrideLog.expires = now - 1000;
              actionOverrideLog.save(iteratorCallback);
            }, 
            function(err){
              if (err) { return innerCallback(err);}
              return innerCallback();
            }
          );
        });
      }
    ],
    function(err, results){
      if (err) { return callback(err);}
      return callback();
    });
}


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
                  ts : now,
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

      notificationMessage = "It's almost time for the " + nextPhase.name + " phase.";
      notification = new NotificationModel({
        gpi : growPlanInstance._id,
        users : growPlanInstance.users,
        ts : now,
        type : notificationType,
        msg : notificationMessage
      });
      notification.save();  
      });
    });
}


function clearPendingNotifications (NotificationModel, callback){
  var now = new Date();
  NotificationModel
  .find()
  .where('timeSent')
  .equals(null)
  .populate('users', 'email')
  .exec(function(err, notificationResults){
    if (err) { return callback(err); }
    if (!notificationResults.length){ return callback(); }
    var emailTransport = nodemailer.createTransport("SES", EmailConfig.amazonSES.api);
    
    async.forEach(
      notificationResults, 
      function (notification, iteratorCallback){
        var mailOptions = {
            from: "notifications@bitponics.com", // sender address
            to: notification.users.map(function(user) { return user.email; }).join(', '), 
            subject: "Bitponics Notification", // Subject line
            text: notification.msg,
            html: notification.msg
        };
        emailTransport.sendMail(mailOptions, function(err, response){
          if(err){ return iteratorCallback(err); }
          notification.timeSent = now;
          notification.viewed = true;
          notification.save(iteratorCallback);
        });
      },
      function (err){
        if (err) { return callback(err);}
      }
    );
  });
}


module.exports = {
  logSensorLog : logSensorLog,
  activateGrowPlanInstance : activateGrowPlanInstance,
  activatePhase : activatePhase,
  triggerActionOverride : triggerActionOverride,
  scanForPhaseChanges : scanForPhaseChanges,
  clearPendingNotifications : clearPendingNotifications
};