define(['moment', 'fe-be-utils'], function(moment, utils){
  var viewModels = {};


  
  /**
   * Populate GrowPlanInstance viewModel properties
   * Assumes growPlanInstance.growPlan is a fully-populated GP
   * 
   * phases[].daySummaries[].date
   * phases[].phase
   * activePhase
   * device.status.activeActions[].control
   * device.status.activeActions[].outputId
   */
  viewModels.initGrowPlanInstanceViewModel = function (growPlanInstance){

  	
    // growPlanInstance.phases only contains phases that the GPI has gone through.
    // Add future growPlan phases for the visual 

    var currentGrowPlanPhaseId = growPlanInstance.phases.filter(
      function(growPlanInstancePhase){ 
        return growPlanInstancePhase.active;
      }
    )[0].phase,
    currentGrowPlanPhaseIndex;

    growPlanInstance.growPlan.phases.forEach(function(growPlanPhase, index){
      // get the active gpi.phase.phase. find the gp.phases that are after that
      // one. append those to gpi.phases

      if (growPlanPhase._id === currentGrowPlanPhaseId) {
        currentGrowPlanPhaseIndex = index;
      }

      if (index > currentGrowPlanPhaseIndex){
        growPlanInstance.phases.push({
          phase : growPlanPhase._id,
          daySummaries : []
        });
      }
    });


    // Now initialize the gpi phase data
    growPlanInstance.phases.forEach(function(growPlanInstancePhase, phaseIndex){
  		var startDate = growPlanInstancePhase.startDate,
          i;
      
      if (growPlanInstance.growPlan.phases){
  			growPlanInstancePhase.phase = growPlanInstance.growPlan.phases.filter(
          function(growPlanPhase){
            return growPlanPhase._id === growPlanInstancePhase.phase;
          }
        )[0];
  		}
  		
      // ensure there's a daySummary for each day of each phase, past and future
      for (i = 0; i < growPlanInstancePhase.phase.expectedNumberOfDays; i++){
        if (!growPlanInstancePhase.daySummaries[i]){
          growPlanInstancePhase.daySummaries[i] = { status : utils.PHASE_DAY_SUMMARY_STATUSES.EMPTY };
        }
      }

      var phaseStartingOnGrowPlanInstanceDay = 0;
      for (var i = 0; i < phaseIndex; i++){
        phaseStartingOnGrowPlanInstanceDay += growPlanInstance.phases[i].daySummaries.length;
      }

      growPlanInstancePhase.daySummaries.forEach(function(daySummary, daySummaryIndex){
        var daySummaryIndexInGrowPlan = daySummaryIndex + phaseStartingOnGrowPlanInstanceDay;

        if (!daySummary.date) {
          daySummary.date = moment(startDate).add('days', daySummaryIndexInGrowPlan);
        }
        if (!daySummary.status) {
          daySummary.status = utils.PHASE_DAY_SUMMARY_STATUSES.EMPTY;
        }
        daySummary.dateKey = utils.getDateKey(daySummary.date);
      });
      
      if (growPlanInstancePhase.active){
        growPlanInstance.activePhase = growPlanInstancePhase;
      }
  	});

    
    if (growPlanInstance.device){
      if (growPlanInstance.device.status.activeActions){
        growPlanInstance.device.status.activeActions.forEach(function(activeAction){
          activeAction = viewModels.initActionViewModel(activeAction);
          activeAction.control = viewModels.initControlViewModel(activeAction.control);
          activeAction.outputId = growPlanInstance.device.outputMap.filter(function(outputMapping){
            return outputMapping.control === activeAction.control._id;
          })[0].outputId;
        });
      }
    }

  	return growPlanInstance;
  };


  /**
   * Get a string key for the date, for use as object keys in a date hash
   * 
   * @param {Date} date
   * @return {string} A string in the format YYYY-MM-DD
   */
  utils.getDateKey = function(date){
    return moment(date).format("YYYY-MM-DD");
  };


  /**
   * Adds/calculates properties necessary for UI presentation
   *
   * Adds the following properties:
   * className
   */
  viewModels.initControlViewModel = function (control){
    control.className = control.name.replace(/\s/g,'').toLowerCase();
    return control;
  };



  /**
   * Adds/calculates properties necessary for UI presentation
   *
   * Converts sensor readings array to a hash, keyed by sensor code
   */
  viewModels.initSensorLogsViewModel = function (sensorLogs){
    sensorLogs.forEach(viewModels.initSensorLogViewModel);
    return sensorLogs;
  };


  /**
   * Adds/calculates properties necessary for UI presentation
   *
   * Converts sensor readings array to a hash, keyed by sensor code
   */
  viewModels.initSensorLogViewModel = function (sensorLog){
    sensorLog.logs.forEach(function (log) {
      sensorLog[log.sCode] = log.val;
    });
    // delete array to save memory, since we're not going to use it anymore
    delete sensorLog.logs;
    return sensorLog;
  };

  /**
   * Adds/calculates properties necessary for UI presentation
   *
   * Sets the following properties:
   * plantsViewModel
   * phases[].idealRanges[].noApplicableTimeSpan
   * phases[].actionsViewModel
   * phases[].nutrientsViewModel
   * currentVisiblePhase
   */
  viewModels.initGrowPlanViewModel = function (growPlan){
    var initActionViewModel = viewModels.initActionViewModel;

		growPlan.plantsViewModel = {};
		growPlan.plants.forEach(function(plant){
			growPlan.plantsViewModel[plant._id] = plant;
		});

    growPlan.phases.forEach(function(phase, index){
      phase.idealRanges.forEach(function(idealRange, idealRangeIndex){
        if (!idealRange.applicableTimeSpan){
          idealRange.noApplicableTimeSpan = true;
        }
      });

      phase.actionsViewModel = [];
      phase.actions.forEach(function(action){
        phase.actionsViewModel.push(initActionViewModel(action, 'phaseStart'));
      });
      phase.phaseEndActions.forEach(function(action){
        phase.actionsViewModel.push(initActionViewModel(action, 'phaseEnd'));
      });

      phase.nutrientsViewModel = {};
      phase.nutrients.forEach(function(nutrient){
      	phase.nutrientsViewModel[nutrient._id] = nutrient;
      });

    });


    growPlan.currentVisiblePhase = growPlan.phases[0];

    return growPlan;
  };


  /**
   * Adds/calculates properties necessary for UI presentation
   * Properties for control vs no-control presentation,
   * daily vs non-daily cycles. Makes changes in-place on the provided Action.
   *
   * Adds the following properties:
   * action.scheduleType (string) : 'phaseStart' || 'phaseEnd' || 'repeat'
   * action.isDailyControlCycle (boolean)
   * action.dailyOnTime (set if isDailyControlCycle)
   * action.dailyOffTime (set if isDailyControlCycle)
   * action.message (set if a no-control action)
   * action.offsetTimeOfDay (set if a repeating action with an offset)
   * action.overallDurationInMilliseconds
   * action.overallDuration (an integer duration of action.overallDurationType)
   * action.overallDurationType (months||weeks||days||hours||minutes||seconds)
   *
   * @param action
   * @param source (optional): 'phaseStart' || 'phaseEnd'
   *
   * @return action. The modified Action object.
   */
  viewModels.initActionViewModel = function(action, source){
    var overallDuration = 0,
      offsetDurationInMilliseconds = moment.duration(action.cycle.offset.duration, action.cycle.offset.durationType).asMilliseconds(),
      asMonths,
      asWeeks,
      asDays,
      asHours,
      asMinutes,
      asSeconds,
      firstTime,
      secondTime;

    // Set scheduleType
    if (source === 'phaseStart'){
      if (action.cycle.repeat){
        action.scheduleType = 'repeat';
      }
      else {
        action.scheduleType = 'phaseStart';
      }
    } else {
      action.scheduleType = 'phaseEnd';
    }

    // Set overallDuration
    action.isDailyControlCycle = false;
    action.cycle.states.forEach(function(state){
      overallDuration += moment.duration(state.duration || 0, state.durationType || '').asMilliseconds();
    });
    action.overallDurationInMilliseconds = overallDuration;
    
    overallDuration = utils.getLargestWholeNumberDurationObject(overallDuration);

    action.overallDuration = overallDuration.duration;
    action.overallDurationType = overallDuration.durationType;

    if (action.overallDurationType === 'days' && action.overallDuration === 1){
      // If it's an accessory with a daily cycle, we want to show daily
      // on/off times
      if (action.control){
        action.isDailyControlCycle = true;
        
        firstTime = offsetDurationInMilliseconds;
        secondTime = offsetDurationInMilliseconds + moment.duration(action.cycle.states[0].duration, action.cycle.states[0].durationType).asMilliseconds();

        if (parseInt(action.cycle.states[0].controlValue, 10) === 0){
          action.dailyOffTime = firstTime;
          action.dailyOnTime = secondTime;
        } else {
          action.dailyOnTime = firstTime;
          action.dailyOffTime = secondTime;
        }
      }
    }

    action.offsetTimeOfDay = offsetDurationInMilliseconds;
    
    // If no control, then this is just a repeating notification.
    // Get the message from the state that has a message
    if (!action.control && action.cycle && action.cycle.states.length){
      for (var stateIndex = 0, statesLength = action.cycle.states.length; stateIndex < statesLength; stateIndex++){
        if (action.cycle.states[stateIndex].message){
          action.message = action.cycle.states[stateIndex].message;
          break;
        }
      }
    }

    return action;
  };


  /**
   * Convert GrowPlan ViewModel back to server model
   */
  viewModels.compileGrowPlanViewModelToServerModel = function(growPlan){
    var key;
    growPlan.plants = [];
    for (key in growPlan.plantsViewModel){
    	if (growPlan.plantsViewModel.hasOwnProperty(key)){
    		growPlan.plants.push(growPlan.plantsViewModel[key]);
    	}
    }
    delete growPlan.plantsViewModel;

    growPlan.phases.forEach(function(phase, index){
      phase.idealRanges.forEach(function(idealRange, idealRangeIndex){
        if (idealRange.noApplicableTimespan){
          idealRange.applicableTimespan = undefined;
        }
      });

      phase.actions = [];
      phase.phaseEndActions = [];

      phase.actionsViewModel.forEach(function(actionViewModel){
        switch(actionViewModel.scheduleType){
          case 'phaseStart':
          case 'repeat':
            phase.actions.push(viewModels.compileActionViewModelToServerModel(actionViewModel));
            break;
          case 'phaseEnd':
            phase.phaseEndActions.push(viewModels.compileActionViewModelToServerModel(actionViewModel));
            break;
        }
      });

      delete phase.actionsViewModel;


      phase.nutrients = [];
	    for (key in phase.nutrientsViewModel){
	    	if (phase.nutrientsViewModel.hasOwnProperty(key)){
	    		phase.nutrients.push(phase.nutrientsViewModel[key]);
	    	}
	    }
	    delete phase.nutrientsViewModel;
    });

    growPlan.currentVisiblePhase = undefined;

    return growPlan;
  };


  /**
   * Convert Action ViewModel back to server model
   *
   * Converts the following viewModel properties back to server model format:
   * action.scheduleType (string) : 'phaseStart' || 'phaseEnd' || 'repeat'
   * action.isDailyControlCycle (boolean)
   * action.dailyOnTime (set if isDailyControlCycle)
   * action.dailyOffTime (set if isDailyControlCycle)
   * action.message (set if a no-control action)
   * action.offsetTimeOfDay (set if a repeating action with an offset)
   * action.overallDuration
   * action.overallDurationType (months||weeks||days||hours||minutes||seconds)
   *
   */
  viewModels.compileActionViewModelToServerModel = function(action){
    var ACCESSORY_ON = utils.ACCESSORY_VALUES.ON,
      ACCESSORY_OFF = utils.ACCESSORY_VALUES.OFF,
      dailyOnTimeAsMilliseconds,
      dailyOffTimeAssMilliseconds;

    if (action.scheduleType === 'repeat'){
      action.cycle.repeat = true;
      if (action.control) {
        // Non-daily control cycles need no special treatment...the Angular data-binding
        // sets the correct properties straight-away
        if (action.isDailyControlCycle) {
          action.cycle.states = [];
          
          if (action.dailyOnTime < action.dailyOffTime){
            action.cycle.offset = {
              durationType : 'hours',
              duration : moment.duration(action.dailyOnTime).asHours()
            };
            action.cycle.states.push({
              controlValue : ACCESSORY_ON,
              durationType : 'hours',
              duration : moment.duration(action.dailyOffTime - action.dailyOnTime).asHours()
            });
            action.cycle.states.push({
              controlValue : ACCESSORY_OFF,
              durationType : 'hours',
              duration : (24 - moment.duration(action.dailyOffTime - action.dailyOnTime).asHours())
            });
          } else {
            action.cycle.offset = {
              durationType : 'hours',
              duration : moment.duration(action.dailyOffTime).asHours()
            };
            action.cycle.states.push({
              controlValue : ACCESSORY_OFF,
              durationType : 'hours',
              duration : moment.duration(action.dailyOnTime - action.dailyOffTime).asHours()
            });
            action.cycle.states.push({
              controlValue : ACCESSORY_ON,
              durationType : 'hours',
              duration : (24 - moment.duration(action.dailyOnTime - action.dailyOffTime).asHours())
            });
          }
        }
      } else {
        // action does not have a control
        action.cycle.states = [];
        if (action.overallDurationType === 'days' && action.offsetTimeOfDay){
          action.cycle.offset = {
            durationType : 'hours',
            duration: moment.duration(action.offsetTimeOfDay).asHours()
          };
        } else {
          action.cycle.offset = {
            duration: 0
          };          
        }

        action.cycle.states.push({
          message: action.message
        });

        action.cycle.states.push({
          durationType : action.overallDurationType,
          duration : action.overallDuration
        });
      }
    }

    delete action.scheduleType;
    delete action.isDailyControlCycle;
    delete action.dailyOnTime;
    delete action.dailyOffTime;
    delete action.message;
    delete action.offsetTimeOfDay;
    delete action.overallDuration;
    delete action.overallDurationType;


    return action;
  };

  return viewModels;
});