var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	GrowPlan = require('./growPlan').model,
	User = require('./user').model,
	GrowPlanInstanceModel,
  async = require('async'),
  winston = require('winston'),
  tz = require('timezone/loaded');

/**
 * GrowPlanInstance 
 */
var GrowPlanInstanceSchema = new Schema({

	users : [{ type: ObjectId, ref: 'User' }],
	
	owner : { type: ObjectId, ref: 'User', required: true },

	growPlan : { type : ObjectId, ref : 'GrowPlan', required: true},
	
	device : { type : ObjectId, ref : 'Device', required: false }, //the bitponics device
	
	startDate: { type: Date, required: true },

	endDate: { type: Date },

  active: { type: Boolean, required: true },

	phases: [{
		phase: Schema.Types.ObjectId, // ObjectId of GrowPlan.Phase
		startDate: { type: Date }, // actual date the phase was started. null/undefined if not yet started
		endDate: { type: Date }, // actual date the phase was ended. null/undefined if not yet ended
		/**
		 * set whenever a phase is started, based on GrowPlan.Phase.expectedNumberOfDays. 
		 * used by the worker process to query & notify of impending phase advancement
		 */
		expectedEndDate : { type : Date }, 
		active: { type: Boolean }
	}],

	// not in use yet, but this will be how a user configures the view on their Dashboard
	settings : {
		visibleSensors : []
	},
	
	/**
	 * Sensor logs for the past 24 hours.
	 */
	recentSensorLogs: [{
		ts: { type: Date, required: true, default: Date.now },
		logs : [{
			/**
			 * sCode references to Sensor.code
			 */
			sCode: { type: String, ref: 'Sensor', required: true },
			val: { type: Number }
		}]
	}],
	
	/**
	 * Photo logs for the past 24 hours
	 */
	recentPhotoLogs: [{
		ts: { type: Date, required: true, default: Date.now },
		logs : [{
			url: { type : mongoose.SchemaTypes.Url, required: true},
			tags: { type : [String]}
		}]
	}],
	
	/**
	 * Tag Logs for the past 24 hours
	 */
	recentTagLogs: [{
		ts: { type: Date, required: true, default: Date.now },
		logs : [{
			val: { type: String, required: true },
			tags: { type : [String]}
		}]
	}],
	visibility : { type: String, enum: ['public', 'private'], default: 'public'}
});

GrowPlanInstanceSchema.plugin(useTimestamps); // adds createdAt/updatedAt fields to the schema, and adds the necessary middleware to populate those fields 



GrowPlanInstanceSchema.index({ device: 1, active: 1 });
GrowPlanInstanceSchema.index({ active: 1, 'phases.expectedEndDate' : 1 });





/******************** STATIC METHODS  ***************************/

/**
 * Create a new GrowPlanInstance from the specified GrowPlan
 * 
 * @param options.growPlan (required)
 * @param options.owner (required)
 * @param options.users (required) 
 * @param options.activate (required) Boolean indicating whether to immediately activate the grow plan instance
 * @param options.device (optional) If present, sets the device property on the grow plan instance
 * @param options.activePhaseId (optional) The _id of a growPlan.phase. If present, sets the active phase on the grow plan instance
 * @param options.activePhaseDay (optional) Indicates the number of days into the active phase. Used to offset gpi.phases.expectedEndDate
 */

GrowPlanInstanceSchema.static('create', function(options, callback) {
  var gpi = new GrowPlanInstanceModel({
    owner : options.owner,
    users : options.users || [options.owner],
    growPlan : options.growPlan,
    device : options.device
  });
  
  // add the phases
  options.growPlan.phases.forEach(function(phase){
    gpi.phases.push({ phase : phase._id});
  })

  gpi.save(function(err){
    if (!options.activate){
      return callback();
    }
     
    return gpi.activate({ 
      activePhaseId : options.activePhaseId,
      activePhaseDay : options.activePhaseDay        
    },
    callback);
  });
});
/******************* END STATIC METHODS  ***************************/




/************** INSTANCE METHODS ********************/


/**
 * Activate an existing grow plan instance. If there's a device, update the device's activeGrowPlanInstance property
 * and remove the device from any other GPI's that are using it. 
 *
 * @param options.activePhaseId (optional) The _id of a growPlan.phase. If present, sets the active phase on the grow plan instance. If not present,
 *        the first phase will be activated.
 * @param options.activePhaseDay (optional) Indicates the number of days into the active phase. Used to offset gpi.phases.expectedEndDate
 */
GrowPlanInstanceSchema.method('activate', function(options, callback) {
	var gpi = this,
      now = new Date(),
      activePhaseId = options.activePhaseId || gpi.phases[0].phase;

	  gpi.active = true;
	  gpi.startDate = now;
	  
    gpi.save(function (err){
      if (err) { return callback(err);}

      async.parallel([
        function (innerCallback){
          gpi.activatePhase({
            phaseId : options.phaseId,
            phaseDay : options.phaseDay,
            save : true
          },
          innerCallack);
        },
        function (innerCallback){
          if (!gpi.device){ return innerCallback();}

          DeviceModel.findById(gpi.device, function(err, deviceResult){
            if (err) { return callback(err); }
            if (!deviceResult){ return callback(new Error('No device found for specified id')); }

            deviceResult.activeGrowPlanInstance = gpi;

            deviceResult.save(function(err){
              if (err) { return callback(err); }
              return gpi.save(callback);     
            });
          });

          // TODO : check for other Devices that have activeGrowPlanInstance set to this. do something....
        }
      ],
      function(err, results){
        callback(err);
      }
    );
  });
});


/**
 * Activate a phase on a grow plan instance. 
 * 
 * Assumes a populated GrowPlan and User
 *
 * @param options.phaseId (required) phaseId of the growPlan.phase
 * @param options.phaseDay (optional) Number of days into the phase. Used to offset phase.expectedEndDate
 * @param options.save (optional) Boolean indicating whether the GrowPlanInstance should be saved in the end (should be false if calling function will execute a save)
 */
GrowPlanInstanceSchema.method('activatePhase', function(options, callback) {
  var Action = require('./action'),
      ActionModel = Action.model,
      ActionUtils = Action.utils,
      NotificationModel = require('./notification').model,
      ActionOverrideLogModel = require('./actionOverrideLog').model,
      growPlanInstance = this,
      growPlan = growPlanInstance.growPlan,
      phaseId = options.phaseId,
      device = growPlanInstance.device,
      now = new Date(),
      phaseDay = options.phaseDay || 0,
      growPlanPhase = growPlan.phases.filter(function(item){ return item._id.equals(phaseId);})[0],
      actionsWithDeviceControl = [];
  
  growPlanInstance.phases.forEach(function(phase){
    if (phase.phase.equals(phaseId)){
      phase.active = true;
      phase.startDate = now; 
      phase.expectedEndDate = now + (growPlanPhase.expectedNumberOfDays * 24 * 60 * 60 * 1000) - (phaseDay * 24 * 60 * 60 * 1000);
    } else {
      if (phase.active == true){
        phase.endDate = now;
      }
      phase.active = false;
    }
  });
  
  if (device){
    actionsWithDeviceControl = growPlanPhase.actions.filter(
      function(item){ 
        return (item.control && device.controlMap.some(function(controlPair){ return item.control.equals(controlPair.control);})); 
      }
    );;
  }


  // First, save the gpi
  // Then, in parallel:
  // expire any existing action overrides
  // expire all existing notifications
  // Finally,
  // activate the new phases' actions & send notifications
  
  async.serial(
    [
      function (innerCallback){
        if (options.save) {
          return growPlanInstance.save(innerCallback);
        } else {
          return innerCallback();
        }
      },
      function (innerCallback){

        async.parallel([
          function (innerParallelCallback){
            NotificationModel
            .find()
            .where('gpi')
            .equals(growPlanInstance._id)
            .where('timeToSend')
            .gte(now)
            .exec(function(err, existingNotifications){
              if (err) { return innerParallelCallback(err); }
              async.forEach(
                existingNotifications,
                function notificationIterator(notification, iteratorCallback){
                  notification.timeToSend = null;
                  notification.save(iteratorCallback);
                },
                function notificationLoopComplete(err){
                  innerParallelCallback(err);
                }
              );
            });
          },
          function (innerParallelCallback){
            if (!device){ return innerParallelCallback(); }
              
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
              if (err) { return innerParallelCallback(err);}
              if (!actionOverrideLogResults.length){ return innerParallelCallback(); }
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
                  if (err) { return innerParallelCallback(err);}
                  return innerParallelCallback();
                }
              );
            });
          }
        ],
        function (err, results){
          return innerCallback(err);
        }
        );
      },
      function (innerCallback){
        ActionModel
        .find()
        .where('_id')
        .in(growPlanPhase.actions)
        .populate('control')
        .exec(function (err, actionResults){
          if (err) { return innerCallback(err); }
          if (!actionResults.length) { return innerCallback(); }
          
          async.forEach(
            actionResults, 
            function(action, iteratorCallback){
              var notificationsToSave = [],
                actionNotification = new NotificationModel({
                  users : growPlanInstance.users,
                  gpi : growPlanInstance,
                  timeToSend : now,
                  msg : growPlanPhase.name + ' phase started. Time to trigger the action "' + action.description + '".'
                });

              notificationsToSave.push(actionNotification);

              // Check if this has a device control
              if (action.control && 
                  actionsWithDeviceControl.some(function(item){
                    return action.control._id.equals(item.control);
                  })
                  ){
                    actionNotification.type = 'info';
                    actionNotification.msg += ' Since you have a ' + action.control.name + ' connected, we\'ve done this automatically.';
              } else {
                actionNotification.type = 'actionNeeded';
                actionNotification.msg += ' ';

                if (action.cycle.repeat){
                  actionNotification.msg += " This action has a repeating cycle associated with it, so we'll notify you ";
                  // cycles with repeat=true are required to have 2 or 3 states (through validation rules)
                  // since a 3-state cycle is just an offset 2-state cycle,
                  // the logic for them ends up being the same here
                  var states = action.cycle.states;
                  
                  if (states[0].durationType && !states[1].durationType){
                    // state 0 has a duration and state 1 does not
                    notificationsToSave.push(new NotificationModel({
                      users : growPlanInstance.users,
                      gpi : growPlanInstance,
                      timeToSend : now + ActionUtils.convertDurationToMilliseconds(state[0].durationType, state[0].duration),
                      msg : 'As part of "' + action.description + '", it\'s time to take the following action: "' + state[1].message + '"',
                      repeat : {
                        type : states[0].durationType,
                        duration : states[0].duration,
                        tz : growPlanInstance.user.timezone
                      },
                      type : 'actionNeeded'
                    }));
                  } else if (!states[0].durationType && states[1].durationType){
                    // state 0 does not have a duration and state 1 does
                    notificationsToSave.push(new NotificationModel({
                      users : growPlanInstance.users,
                      gpi : growPlanInstance,
                      timeToSend : now,
                      msg : 'As part of "' + action.description + '", it\'s time to take the following action: "' + state[0].message + '"',
                      repeat : {
                        type : states[1].durationType,
                        duration : states[1].duration,
                        tz : growPlanInstance.user.timezone
                      },
                      type : 'actionNeeded'
                    }));
                  } else if (states[0].durationType && states[1].durationType){
                    // both states have durations
                    notificationsToSave.push(new NotificationModel({
                      users : growPlanInstance.users,
                      gpi : growPlanInstance,
                      timeToSend : now + ActionUtils.convertDurationToMilliseconds(state[0].durationType, state[0].duration),
                      msg : 'As part of "' + action.description + '", it\'s time to take the following action: "' + state[1].message + '"',
                      repeat : {
                        type : 'seconds',
                        duration : action.overallCycleTimespan * 1000,
                        tz : growPlanInstance.user.timezone
                      },
                      type : 'actionNeeded'
                    }));

                    notificationsToSave.push(new NotificationModel({
                      users : growPlanInstance.users,
                      gpi : growPlanInstance,
                      timeToSend : now,
                      msg : 'As part of "' + action.description + '", it\'s time to take the following action: "' + state[0].message + '"',
                      repeat : {
                        type : 'seconds',
                        duration : action.overallCycleTimespan * 1000,
                        tz : growPlanInstance.user.timezone
                      },
                      type : 'actionNeeded'
                    }));
                  }
                }
              }

              async.forEach(
                notificationsToSave, 
                function(notificationToSave, innerIteratorCallback){
                  notificationToSave.save(innerIteratorCallback);
                },
                function(err){
                  return iteratorCallback(err);
                }
              );
            },
            function(err){
              if (err) { return innerCallback(err); }
              innerCallback();
            }
          );
        });
      }
    ],
    function(err, results){
      if (err) { return callback(err);}
      return callback();
    }
  );
});

/************** END INSTANCE METHODS ********************/




/***************** MIDDLEWARE **********************/
/**
 * Remove old recentXLogs
 */
GrowPlanInstanceSchema.pre('save', true, function(next, done){
	next();

	var now = Date.now(),
		cutoff = now - (1000 * 60 * 2), // now - 2 hours
		logsToRemove = [];
	

	this.recentSensorLogs.forEach(function(log){
		if (log.ts < cutoff) { logsToRemove.push(log); }
	});

	this.recentPhotoLogs.forEach(function(log){
		if (log.ts < cutoff) { logsToRemove.push(log); }
	});

	this.recentTagLogs.forEach(function(log){
		if (log.ts < cutoff) { logsToRemove.push(log); }
	});

	logsToRemove.forEach(function(log){
		log.remove();
	});

	done();
});

/***************** END MIDDLEWARE **********************/

GrowPlanInstanceModel = mongoose.model('GrowPlanInstance', GrowPlanInstanceSchema);
exports.schema = GrowPlanInstanceSchema;
exports.model = GrowPlanInstanceModel;