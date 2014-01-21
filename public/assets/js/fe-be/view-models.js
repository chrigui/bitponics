define(['moment', 'fe-be-utils'], function(moment, utils){
  var viewModels = {};


  
  /**
   * Populate GrowPlanInstance viewModel properties
   * Assumes growPlanInstance.growPlan is a fully-populated GP
   * If growPlanMigrations[].oldGrowPlan are populated, it will assign them to the appropriate growPlanInstance.phases[].growPlan
   * 
   * Assigns the following properties:
   * 
   * - phases[].daySummaries[].date
   * - phases[].phase
   * - phases[].growPlan
   * - phases[].calculatedStartDate : phase.startDate or the projected startDate the phase would have started in the past or future
   * - activePhase
   * - nextGrowPlanPhase
   * - growPlansById {Object} : Grow Plans the garden has used (pulled from .growPlan and .growPlanMigrations). Keyed by grow plan _id
   * - device.status.activeActions[].control
   * - device.status.activeActions[].outputId
   * 
   * @param {Object} growPlanInstance,
   * @param {Object} controlHash : Keyed by control._id
   */
  viewModels.initGrowPlanInstanceViewModel = function (growPlanInstance, controlHash){

  	if(!growPlanInstance.phases.length){
      return true
    }

    // growPlanInstance.phases only contains phases that the GPI has gone through.
    // Add past & future growPlan phases for the visual 

    var activeGrowPlanInstancePhase = growPlanInstance.phases.filter(
      function(growPlanInstancePhase){ 
        return growPlanInstancePhase.active;
      }
    )[0],
    currentGrowPlanPhaseId = activeGrowPlanInstancePhase.phase,
    currentGrowPlanPhaseIndex,
    now = new Date(),
    nowMoment = moment(now);



    // Create a hash of the grow plans the garden has used, keyed by id
    growPlanInstance.growPlansById = {};
    growPlanInstance.growPlansById[growPlanInstance.growPlan._id] = growPlanInstance.growPlan;
    if (growPlanInstance.growPlanMigrations.length) {
      growPlanInstance.growPlanMigrations.forEach(function(growPlanMigration){
        growPlanInstance.growPlansById[growPlanMigration.oldGrowPlan._id] = growPlanMigration.oldGrowPlan;
      });
    }

    

    // If we're looking at a GPI that's on its original GP, show all phases, even if they're past
    // If we're looking at a GPI that's gone through a migration, don't show past phases (since the user has passed over those phases in previous growPlans)
    var includePastPhases = (growPlanInstance.growPlanMigrations.length === 0);



    // First, go through garden phases & set the calculatedStartDate & offset the daySummaries by startedOnDay
    growPlanInstance.phases.forEach(function(growPlanInstancePhase, phaseIndex){
      growPlanInstancePhase.calculatedStartDate = moment(growPlanInstancePhase.startDate);//.subtract("days", growPlanInstancePhase.startedOnDay);  // this offset start date calculation is probably not actually necessary
      growPlanInstancePhase.daySummaries = growPlanInstancePhase.daySummaries.slice(growPlanInstancePhase.startedOnDay || 0);
    });

    growPlanInstance.growPlan.phases.forEach(function(growPlanPhase, index){
      if (growPlanPhase._id === currentGrowPlanPhaseId) {
        currentGrowPlanPhaseIndex = index;
      }
    });


    growPlanInstance.growPlan.phases.forEach(function(growPlanPhase, index){
      // get the active gpi.phase.phase. find the gp.phases that are after that
      // one. append those to gpi.phases

      if ( (index < currentGrowPlanPhaseIndex) &&
          (includePastPhases)){
        var gpiPhaseExists = growPlanInstance.phases.some(function(gpiPhase){
          return (gpiPhase.phase === growPlanPhase._id)
        });
        
        if (!gpiPhaseExists){
          var calculatedStartDate = moment(activeGrowPlanInstancePhase.startDate);

          for (var i = index; i < currentGrowPlanPhaseIndex; i++){
            calculatedStartDate.subtract("days", growPlanInstance.growPlan.phases[i].expectedNumberOfDays);
          }

          growPlanInstance.phases.unshift({
            growPlan : growPlanInstance.growPlan._id,
            phase : growPlanPhase._id,
            daySummaries : [],
            calculatedStartDate : calculatedStartDate
          });
        }
      }


      if (index > currentGrowPlanPhaseIndex){
        //var calculatedStartDate = moment(activeGrowPlanInstancePhase.startDate);

        for (var i = currentGrowPlanPhaseIndex; i < index; i++){
          //calculatedStartDate.add("days", growPlanInstance.growPlan.phases[i].expectedNumberOfDays);
        }

        growPlanInstance.phases.push({
          growPlan : growPlanInstance.growPlan._id,
          phase : growPlanPhase._id,
          daySummaries : [],
          //calculatedStartDate : calculatedStartDate
        });
      }
    });


    // Now initialize the gpi phase data
    growPlanInstance.phases.forEach(function(growPlanInstancePhase, phaseIndex){
  		var i;
      
      growPlanInstancePhase.phase = growPlanInstance.growPlansById[growPlanInstancePhase.growPlan].phases.filter(
        function(growPlanPhase){
          return growPlanPhase._id === growPlanInstancePhase.phase;
        }
      )[0];
  		
  		
      
      // ensure there's a daySummary for each day of each phase
      // All past days, future days only if it's the active phase (hasn't ended yet)
      var phaseComplete = !!growPlanInstancePhase.endDate,
          phaseDaysCompleted = 0;
      // if endDate is defined
      if (phaseComplete){
        phaseDaysCompleted = moment(growPlanInstancePhase.endDate).diff(growPlanInstancePhase.startDate, 'days');
      } else {
        phaseDaysCompleted = moment(growPlanInstancePhase.endDate).diff(now, 'days');
      }

      if (phaseComplete){
        for (i = 0; i < phaseDaysCompleted; i++){
          if (!growPlanInstancePhase.daySummaries[i]){
            growPlanInstancePhase.daySummaries[i] = {};
          }
        }  
      } else {
        for (i = 0; i < growPlanInstancePhase.phase.expectedNumberOfDays; i++){
          if (!growPlanInstancePhase.daySummaries[i]){
            growPlanInstancePhase.daySummaries[i] = {};
          }
        }  
      }
      

      growPlanInstancePhase.daySummaries.forEach(function(daySummary, daySummaryIndex){
        if (!daySummary){
          daySummary = growPlanInstancePhase.daySummaries[daySummaryIndex] = {};
        }

        if (growPlanInstancePhase.calculatedStartDate) {
          daySummary.date = moment(growPlanInstancePhase.calculatedStartDate).add("days", daySummaryIndex);
          daySummary.dateKey = utils.getDateKey(daySummary.date);
        }
        
        

        if (!daySummary.status){
          if (daySummary.date && daySummary.date.valueOf() < now.valueOf()){
            daySummary.status = utils.PHASE_DAY_SUMMARY_STATUSES.GOOD;
          } else {
            daySummary.status = utils.PHASE_DAY_SUMMARY_STATUSES.EMPTY;
          }
        }
      });
      

      

      if (growPlanInstancePhase.active){
        growPlanInstance.activePhase = growPlanInstancePhase;
      }

  	});

    // Populate nextGrowPlanPhase. Used for "advance to next phase" button. Fine if it's undefined.
    growPlanInstance.nextGrowPlanPhase = growPlanInstance.growPlan.phases[growPlanInstance.growPlan.phases.indexOf(growPlanInstance.activePhase.phase) + 1];

    
    if (typeof growPlanInstance.device === 'object'){
      viewModels.initDeviceViewModel(growPlanInstance.device, growPlanInstance.device.status, controlHash);
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
   * 
   *
   * 
   */
  viewModels.initLatestSensorLogsViewModel = function (sensorLogViewModel){
    var sensorDataObj = utils.getSensorCodesAndBaseUnit(bpn.pageData.sensors);
    console.log('sensorLogViewModel', sensorLogViewModel);
    sensorLogViewModel.some(function(sensorLog){
      Object.keys(sensorDataObj).forEach(function(code){
        if(sensorDataObj[code].val == null && sensorLog[code] != null){
          sensorDataObj[code].val = sensorLog[code];
          sensorDataObj[code].timestamp = sensorLog.timestamp;
        }
      });
      Object.keys(sensorDataObj).every(function(code){
        // console.log('[every] sensorDataObj[code].val', sensorDataObj[code].val);
        // console.log('[every] code', code);
        // console.log('[every] sensorDataObj[code]', sensorDataObj[code]);
        return sensorDataObj[code].val != null;
      });
    });

    // console.log('sensorDataObj', sensorDataObj);
    return sensorDataObj;
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
   * Adds the following properties:
   * url
   * thumbnailUrl
   */
  viewModels.initPhotoViewModel = function (photo){
    photo.url = '/photos/' + photo._id;
    photo.thumbnailUrl = '/photos/' + photo._id + '/' + utils.PHOTO_THUMBNAIL_SIZE.WIDTH;
    return photo;
  };


  /**
   * Sorts according to date & initializes extra props
   *
   */
  viewModels.initPhotosViewModel = function (photos){
    photos = photos.sort(function(a, b){
      if (a.date < b.date){
        return -1;
      } else {
        return 1;
      }
    });

    photos.forEach(function(photo){
      viewModels.initPhotoViewModel(photo);
    });
    
    return photos;
  };






  /**
   *
   */
  viewModels.initGrowPlanPhaseViewModel = function (phase, sensors){
    var initActionViewModel = viewModels.initActionViewModel;
    
    phase.idealRangesBySensor = {};
    Object.keys(sensors).forEach(function(sensorKey){
      phase.idealRangesBySensor[sensorKey] = {
        sCode : sensorKey,
        noApplicableTimeSpan : true
      };
    });

    phase.idealRanges.forEach(function(idealRange, idealRangeIndex){
      if (!idealRange.applicableTimeSpan){
        idealRange.noApplicableTimeSpan = true;
      }

      phase.idealRangesBySensor[idealRange.sCode] = idealRange;
    });



    phase.actionViewModels = [];
    phase.actions.forEach(function(action){
      phase.actionViewModels.push(initActionViewModel(action, 'phaseStart'));
    });
    phase.phaseEndActions.forEach(function(action){
      phase.actionViewModels.push(initActionViewModel(action, 'phaseEnd'));
    });

    phase.actionViewModelsByControl = {};
    var actionsWithControl = phase.actionViewModels.filter(function(actionViewModel){
      return (!!(actionViewModel.control));
    });
    actionsWithControl.forEach(function(action){
      phase.actionViewModelsByControl[action.control] = action;
    });


    phase.actionViewModelsNoControl = [];
    var actionsWithNoControl = phase.actionViewModels.filter(function(actionViewModel){
      return (!(actionViewModel.control));
    });
    actionsWithNoControl.forEach(function(action){
      phase.actionViewModelsNoControl.push(action);
    });

    phase.nutrientsViewModel = {};
    phase.nutrients.forEach(function(nutrient){
      phase.nutrientsViewModel[nutrient._id] = nutrient;
    });

    return phase;
  };



  /**
   * Adds/calculates properties necessary for UI presentation
   *
   * Sets the following properties:
   * - focusedPhase
   * - focusedPhase.sortedControls - ordered by populated/unpopulated. this is actually set by grow-plans/index.js. just documenting here to doc all view-model properties in one place
   * - focusedPhase.sortedSensors - ordered by populated/unpopulated. this is actually set by grow-plans/index.js. just documenting here to doc all view-model properties in one place
   * - phases[].actionViewModels
   * - phases[].actionViewModelsByControl
   * - phases[].actionViewModelsNoControl
   * - phases[].nutrientsViewModel
   * - phases[].idealRangesBySensor
   * - phases[].idealRangesBySensor.noApplicableTimeSpan
   * 
   * 
   * Unsets the following properties:
   * - phases[].idealRanges (TODO once we remove the dependency in dashboard)
   * - phases[].actions (TODO once we remove the dependency in dashboard)
   */
  viewModels.initGrowPlanViewModel = function (growPlan, sensors){
    
	 growPlan.phases.forEach(function(phase, index){
      viewModels.initGrowPlanPhaseViewModel(phase, sensors);
    });


    growPlan.focusedPhase = growPlan.phases[0];

    return growPlan;
  };



  /**
   * Gets the device status ready to bind to the control graph & overlay.
   * Called on page load as well as when new deviceStatus is received through a socket update.
   *
   * - Merges deviceStatus into current device.status. deviceStatus.activeActions take precedence.
   * - Populates status.activeActions with full control objects
   * - Sets a "baseCycle" property on activeActions. If normal action, this will simply be a copy
   *   of action.cycle. If an ImmediateAction, this will be the cycle of the action it overrides.
   *   Used to bind the overlay details.
   * - Sets a "currentValue" property.
   * - Adds a "sensorsById" hash. Keys are sensor id's, values are boolean of whether the sensor exists in the device.sensors array
   *
   * @param {Object} deviceStatus : the device.status property
   * @param {Array(Control)} controls : array of Control objects. Should contain all that may be referenced in the device status
   */
  viewModels.initDeviceViewModel = function(device, deviceStatus, controlHash, timeOfDayInMilliseconds){
    var activeActionsByControlId = {};
    timeOfDayInMilliseconds = (timeOfDayInMilliseconds || moment().diff(moment().startOf("day")));
    deviceStatus = deviceStatus || device.status;

    deviceStatus.activeActions = deviceStatus.activeActions || [];

    for (var i = deviceStatus.actions.length; i--;){
      var action = deviceStatus.actions[i];
      if (typeof action === 'string'){
        deviceStatus.actions[i] = device.status.actions.filter(function(baseAction){
          return baseAction._id === action;
        })[0];
      }
    }

    deviceStatus.activeActions.forEach(function(action){
      action = viewModels.initActionViewModel(action);

      if (typeof action.control === 'string'){
        action.control = controlHash[action.control];
      }

      action.outputId = device.outputMap.filter(function(outputMapping){
        return outputMapping.control === action.control._id;
      })[0].outputId;


      action.baseCycle = device.status.actions.filter(function(baseAction){
        var baseActionControlId  = '';
        if (typeof baseAction.control === 'string'){
          baseActionControlId = baseAction.control;
        } else {
          baseActionControlId = baseAction.control._id;
        }
        return baseActionControlId === action.control._id;
      })[0].cycle;

      activeActionsByControlId[action.control._id] = action;
    });

    device.status = deviceStatus;


    device.outputMapByControlId = {};
    
    // Assumes device.outputMap[].control is a string id
    device.outputMap.forEach(function(outputMapping){
      device.outputMapByControlId[outputMapping.control] = {
        controlId : outputMapping.control,
        outputId : outputMapping.outputId,
        currentState : activeActionsByControlId[outputMapping.control] ? deviceStatus.outputValues[outputMapping.outputId] : 0
      };
    });

    device.sensorsById = {};
    device.sensors.forEach(function(sensorCode){
      device.sensorsById[sensorCode] = true;
    });

    return deviceStatus;
  };



  viewModels.initDeviceOutputState = function(device, timeOfDayInMilliseconds){
    device.outputMap
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
    action.cycle.states && action.cycle.states.forEach(function(state){
      state.durationInMilliseconds = moment.duration(state.duration || 0, state.durationType || '').asMilliseconds();
      overallDuration += state.durationInMilliseconds;
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
    
    // If no control, then this is just a repeating reminder.
    // Get the message from the state that has a message
    if (!action.control && action.cycle && action.cycle.states && action.cycle.states.length){
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
   * 
   * Computes all viewModel properties back into server model props and then deletes all viewmodel props
   */
  viewModels.compileGrowPlanViewModelToServerModel = function(growPlan){
    var key;
    
    // Clean up unpopulated placeholder phases
    growPlan.phases = growPlan.phases.filter(function(phase){
      return (phase.name !== 'Add Phase' && phase.name !== 'Untitled');
    });

    growPlan.phases.forEach(function(phase, index){

      phase.sortedControls = undefined;
      phase.sortedSensors = undefined;

      // Populate idealRanges from idealRangesBySensor
      phase.idealRanges = [];
      if (phase.idealRangesBySensor){
        Object.keys(phase.idealRangesBySensor).forEach(function(sensorKey){
          var idealRange = phase.idealRangesBySensor[sensorKey];
          if (phase.idealRanges.indexOf(idealRange) < 0){
            phase.idealRanges.push(idealRange);
          }
        });  
      }
      
      phase.idealRangesBySensor = undefined;

      // Clean up unpopulated placeholder idealRanges
      phase.idealRanges = phase.idealRanges.filter(function(idealRange){ 
        return (typeof idealRange.valueRange !== 'undefined' && (idealRange.valueRange.min !== 'undefined' || typeof idealRange.valueRange.max !== 'undefined'));
      });

      phase.idealRanges.forEach(function(idealRange, idealRangeIndex){
        if (idealRange.noApplicableTimespan){
          idealRange.applicableTimespan = undefined;
        }
      });


      phase.actions = [];
      phase.phaseEndActions = [];

      var compileAndAssignAction = function(actionViewModel){
        switch(actionViewModel.scheduleType){
          case 'phaseStart':
          case 'repeat':
            phase.actions.push(viewModels.compileActionViewModelToServerModel(actionViewModel));
            break;
          case 'phaseEnd':
            phase.phaseEndActions.push(viewModels.compileActionViewModelToServerModel(actionViewModel));
            break;
        }
      };

      if (phase.actionViewModelsByControl){
        Object.keys(phase.actionViewModelsByControl).forEach(function(controlKey){
          var actionViewModel = phase.actionViewModelsByControl[controlKey];
          compileAndAssignAction(actionViewModel);
        });

        phase.actionViewModelsByControl = undefined;
      }

      if (phase.actionViewModelsNoControl){
        phase.actionViewModelsNoControl.forEach(compileAndAssignAction);

        phase.actionViewModelsNoControl = undefined;
      }

      phase.actionViewModels = undefined;

      
      phase.nutrients = [];
	    if (phase.nutrientsViewModel){
        for (key in phase.nutrientsViewModel){
          if (phase.nutrientsViewModel.hasOwnProperty(key)){
            phase.nutrients.push(phase.nutrientsViewModel[key]);
          }
        }
        delete phase.nutrientsViewModel;  
      }
    });

    growPlan.focusedPhase = undefined;

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


  
  /**
   * Initializes each notification as NotificationViewModel
   * Sorts the array according to descending sort date
   *
   * @returns {Array.NotificationViewModel}
   */
  viewModels.initNotificationsViewModel = function(notifications){
    var result = [];

    result = notifications.map(function(notification){
      return viewModels.initNotificationViewModel(notification);
    });    

    result = result.sort(function(notification1, notification2){
      if (notification1.sortDateValue > notification2.sortDateValue){
        return -1;
      } else if (notification1.sortDateValue < notification2.sortDateValue){
        return 1;
      }
      return 0;
    });

    return result;
  };


  /**
   * Adds/calculates properties necessary for UI presentation
   * Makes changes in-place on provided object
   *
   * Converts the following properties to Date objects:
   * - timeToSend
   * - createdAt
   * - updatedAt
   * - sentLogs.timeToSend
   * - sentLogs.emailedAt
   * - sentLogs.checkedAt
   * 
   * Adds the following properties:
   * - notification.sortDateValue {Number} - Date as milliseconds, computed from timeToSend & sentLogs, used when displaying lists of notifications
   * - notification.checked {boolean} - true if the most recent timeToSend has a sentLogs entry and is marked as checked
   *
   * @param {NotificationServerModel} notification
   *
   * @returns {NotificationViewModel} - The modified Notification object.
   */
  viewModels.initNotificationViewModel = function(notification){
    var checked = false,
        now = new Date(),
        nowAsMilliseconds = now.valueOf(),
        notificationTimeToSendAsMilliseconds,
        sortDate;

    notification.timeToSend = notification.timeToSend ? new Date(notification.timeToSend) : undefined;
    notification.createdAt = notification.createdAt ? new Date(notification.createdAt) : undefined;
    notification.updatedAt = notification.updatedAt ? new Date(notification.updatedAt) : undefined;

    if (notification.sentLogs && notification.sentLogs.length){
      notification.sentLogs.forEach(function(sentLog){
        sentLog.timeToSend = sentLog.timeToSend ? new Date(sentLog.timeToSend) : undefined;
        sentLog.emailedAt = sentLog.emailedAt ? new Date(sentLog.emailedAt) : undefined;
        sentLog.checkedAt = sentLog.checkedAt ? new Date(sentLog.checkedAt) : undefined;
      });
    }

    notificationTimeToSendAsMilliseconds = (notification.timeToSend ? notification.timeToSend.valueOf() : undefined);

    if (!notification.timeToSend){
      if (notification.sentLogs.length){
        checked = notification.sentLogs[notification.sentLogs.length-1].checked;
        sortDate = notification.sentLogs[notification.sentLogs.length-1].timeToSend;
      } else {
        checked = true;
      }
    } else {
      // Past timeToSend
      if (notificationTimeToSendAsMilliseconds < nowAsMilliseconds){
        checked = notification.sentLogs.some(function(sentLog){
          return ( (sentLog.timeToSend.valueOf() === notificationTimeToSendAsMilliseconds) && sentLog.checked);
        });

        sortDate = notification.timeToSend;
      } else {
        // Future timeToSend
        checked = (!!notification.sentLogs.length && notification.sentLogs[notification.sentLogs.length-1].checked);

        sortDate = notification.sentLogs.length ? notification.sentLogs[notification.sentLogs.length-1].timeToSend : undefined;
      }
    }

    notification.checked = checked;

    notification.sortDateValue = sortDate ? sortDate.valueOf() : 0;

    return notification;
  };


  return viewModels;
});