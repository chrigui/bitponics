define(['moment', 'fe-be-utils'], function(moment, utils){
  var viewModels = {};


  viewModels.initGrowPlanInstanceViewModel = function (growPlanInstance){
  	growPlanInstance.phases.forEach(function(growPlanInstancePhase, phaseIndex){
  		var startDate = growPlanInstancePhase.startDate;
  		growPlanInstancePhase.daySummaries.forEach(function(daySummary, daySummaryIndex){
  			daySummary.date = moment(startDate).add(daySummaryIndex, 'days');
  		});

  		if (growPlanInstance.growPlan.phases){
  			growPlanInstancePhase.phase = growPlanInstance.growPlan.phases[phaseIndex];	
  		}
  		
  	});

  	return growPlanInstance;
  };

  /**
   * Adds/calculates properties necessary for UI presentation
   */
  viewModels.initControlViewModel = function (control){
    control.className = control.name.replace(/\s/g,'').toLowerCase();
    return control;
  };

  /**
   * Adds/calculates properties necessary for UI presentation
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
   * daily vs non-daily cycles. Makes changes in-plase on the provided Action.
   *
   * Adds the following properties:
   * action.scheduleType (string) : 'phaseStart' || 'phaseEnd' || 'repeat'
   * action.isDailyControlCycle (boolean)
   * action.dailyOnTime (set if isDailyControlCycle)
   * action.dailyOffTime (set if isDailyControlCycle)
   * action.message (set if a no-control action)
   * action.offsetTimeOfDay (set if a repeating action with an offset)
   * action.overallDuration
   * action.overallDurationType (months||weeks||days||hours||minutes||seconds)
   *
   * @param action
   * @param source (optional): 'phaseStart' || 'phaseEnd'
   *
   * @return action. The modified Action object.
   */
  viewModels.initActionViewModel = function(action, source){
    var overallDuration = 0,
      asMonths,
      asWeeks,
      asDays,
      asHours,
      asMinutes,
      asSeconds;

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
    overallDuration = utils.getLargestWholeNumberDurationObject(overallDuration);

    action.overallDuration = overallDuration.duration;
    action.overallDurationType = overallDuration.durationType;

    if (action.overallDurationType === 'days' && action.overallDuration === 1){
      // If it's an accessory with a daily cycle, we want to show daily
      // on/off times
      if (action.control){
        action.isDailyControlCycle = true;
        if (action.cycle.states[0].controlValue === '0'){
          if (action.cycle.states.length === 3){
            // Through server-side validation, we're guaranteed that state[0] and state[3] have the same controlValue
            action.dailyOnTime = moment.duration(action.cycle.states[0].duration, action.cycle.states[0].durationType).asMilliseconds();
            // if first state is off, then OFF trigger time is actually later in the day than ON time.
            // Add ON duration to ON trigger time to get OFF trigger time
            // ON is state[1]
            action.dailyOffTime = action.dailyOnTime + moment.duration(action.cycle.states[1].duration, action.cycle.states[1].durationType).asMilliseconds();
          } else {
            action.dailyOffTime = 0;
            action.dailyOnTime = moment.duration(action.cycle.states[0].duration, action.cycle.states[0].durationType).asMilliseconds();
          }
        } else {
          // else first state of ON cycle
          if (action.cycle.states.length === 3){
            // Through server-side validation, we're guaranteed that state[0] and state[3] have the same controlValue
            action.dailyOffTime = moment.duration(action.cycle.states[0].duration, action.cycle.states[0].durationType).asMilliseconds();
            // if first state is ON, then ON trigger time is actually later in the day than OFF time.
            // Add OFF duration to OFF trigger time to get ON trigger time
            // OFF is state[1]
            action.dailyOnTime = action.dailyOffTime + moment.duration(action.cycle.states[1].duration, action.cycle.states[1].durationType).asMilliseconds();
          } else {
            action.dailyOnTime = 0;
            action.dailyOffTime = moment.duration(action.cycle.states[0].duration, action.cycle.states[0].durationType).asMilliseconds();
          }
        }
      }
    }

    if (action.cycle.states.length === 3){
      action.offsetTimeOfDay = moment.duration(action.cycle.states[0].duration || 0, action.cycle.states[0].durationType || '').asMilliseconds();
    }

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
            action.cycle.states.push({
              controlValue : ACCESSORY_OFF,
              durationType : 'hours',
              duration : moment.duration(action.dailyOnTime).asHours()
            });
            action.cycle.states.push({
              controlValue : ACCESSORY_ON,
              durationType : 'hours',
              duration : moment.duration(action.dailyOffTime - action.dailyOnTime).asHours()
            });
            action.cycle.states.push({
              controlValue : ACCESSORY_OFF,
              durationType : 'hours',
              duration : (24 - moment.duration(action.dailyOffTime).asHours())
            });
          } else {
            action.cycle.states.push({
              controlValue : ACCESSORY_ON,
              durationType : 'hours',
              duration : moment.duration(action.dailyOffTime).asHours()
            });
            action.cycle.states.push({
              controlValue : ACCESSORY_OFF,
              durationType : 'hours',
              duration : moment.duration(action.dailyOnTime - action.dailyOffTime).asHours()
            });
            action.cycle.states.push({
              controlValue : ACCESSORY_ON,
              durationType : 'hours',
              duration : (24 - moment.duration(action.dailyOnTime).asHours())
            });
          }
        }
      } else {
        // action does not have a control
        action.cycle.states = [];
        var overallDurationAsMoment = moment.duration(action.overallDuration, action.overallDurationType),
          lastStateDurationType = action.overallDurationType,
          lastStateDuration = action.overallDuration,
          lastStateDurationAsMilliseconds,
          lastStateDurationObject;

        if (action.overallDurationType === 'days' && action.offsetTimeOfDay){
          action.cycle.states.push({
            durationType : 'hours',
            duration: moment.duration(action.offsetTimeOfDay).asHours()
          });

          lastStateDurationAsMilliseconds = (moment.duration(lastStateDuration, lastStateDurationType).asMilliseconds() - moment.duration(action.offsetTimeOfDay).asMilliseconds());
          lastStateDurationObject = utils.getLargestWholeNumberDurationObject(lastStateDurationAsMilliseconds);
          lastStateDurationType = lastStateDurationObject.durationType;
          lastStateDuration = lastStateDurationObject.duration;
        }

        action.cycle.states.push({
          message: action.message
        });

        overallDurationAsMoment
        action.cycle.states.push({
          durationType : lastStateDurationType,
          duration : lastStateDuration
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