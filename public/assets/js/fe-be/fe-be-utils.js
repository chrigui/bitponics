define(['moment'], function(moment){
  this.bpn = this.bpn || {};
  var utils = (this.bpn.utils = this.bpn.utils || {});


  /**
   *
   * @type {Array}
   */
  utils.DURATION_TYPES = [
    'seconds',
    'minutes',
    'hours',
    'days',
    'weeks',
    'months'
  ];


  /**
   *
   */
  utils.NOTIFICATION_TYPES = {
    INFO : "info",
    ACTION_NEEDED : "actionNeeded",
    ERROR : "error"
  };


  /**
   *
   */
  utils.NOTIFICATION_TRIGGERS = {
    PHASE_END : "phase-end",
    PHASE_END_ACTION : "phase-end-action",
    PHASE_START : "phase-start",
    PHASE_ACTION : "phase-action",
    IDEAL_RANGE_VIOLATION : "ideal-range-violation",
    IMMEDIATE_ACTION : "immediate-action",
    PHASE_ENDING_SOON : "phase-ending-soon",
    GROW_PLAN_UPDATE : "grow-plan-update",
    DEVICE_MISSING : "device-missing"
  };


  /**
   *
   * @type {Object}
   */
  utils.ACCESSORY_VALUES = {
    ON : '1',
    OFF : '0'
  };


  /**
   * Visibility for various user-generated models
   */
  utils.VISIBILITY_OPTIONS = {
    PRIVATE : "private",
    PUBLIC : "public"
  };


  /**
   * Used by the device sensor calibration page
   */
  utils.CALIB_MODES = {
    "PH_4" : "ph_4",
    "PH_7" : "ph_7",
    "PH_10" : "ph_10",
    "PH_DONE" : "ph_done",
    "EC_DRY" : "ec_dr",
    "EC_LO" : "ec_lo",
    "EC_HI" : "ec_hi",
    "EC_DONE" : "ec_done"
  };
  
  
  /**
   * Used to log CalibrationLogs, after a calibration has been
   * completed
   */
  utils.CALIB_LOG_TYPES = {
    "PH" : "ph",
    "EC" : "ec"
  };


  /**
   * Used during device sensor calibration
   */
  utils.CALIB_STATUSES = {
    "SUCCESS" : "success",
    "ERROR" : "error"
  };


  /**
   * Used during device sensor calibration
   */
  utils.PHASE_DAY_SUMMARY_STATUSES = {
    "GOOD" : "good",
    "BAD" : "bad",
    "EMPTY" : "empty"
  };


  /**
   * API Mime Types
   */
  utils.MIME_TYPES = {
    "JSON" : "application/json",
    "BITPONICS" : {
      "PREFIX" : "application/vnd.bitponics",
      "V1" : {
        "DEVICE_TEXT" : "application/vnd.bitponics.v1.deviceText", 
      },
      "V2" : {
        "DEVICE_TEXT" : "application/vnd.bitponics.v2.deviceText", 
      }
    }
  };

  utils.PRODUCT_TYPES = {
    "ACCESSORY" : "accessory",
    "HARDWARE" : "hardware",
    "SERVICE_PLAN" : "service-plan"
  };


  utils.FULFILLMENT_STATUSES = {
    /**
     * Orders start in pending. Once payment is processed, moved to next stage
     */
    "PENDING" : "pending",
    

    /**
     * Orders for physical items are marked as shipped once paid and shipped.
     */
    "SHIPPED" : "shipped",

    
    /**
     * Orders for service plans, once paid, go straight to complete
     */
    "COMPLETE" : "complete"
  };


  utils.ORDER_STATUSES = {
    "ACTIVE_CART" : "active-cart",
    "SUBMITTED" : "submitted",
    "PAID" : "paid",
    "COMPLETE" : "complete"
  };


  utils.PRODUCT_IDS = {
    "BPN_HARDWARE_BASE-STATION_1" : "BPN_HARDWARE_BASE-STATION_1",
    "BPN_ACC_EC-PROBE" : "BPN_ACC_EC-PROBE",
    "BPN_WEB_FREE" : "BPN_WEB_FREE",
    "BPN_WEB_PREMIUM_MONTHLY" : "BPN_WEB_PREMIUM_MONTHLY",
    "BPN_WEB_ENTERPRISE_MONTHLY" : "BPN_WEB_ENTERPRISE_MONTHLY"
  };  


  utils.COMBINED_DEVICE_KEY_SPLITTER = "|";

  /**
   * Suggestions for auto-complete in UI
   */
  utils.suggestions = {
    lightTypes : [
      'Fluorescent',
      'Metal Halide',
      'High Pressure Sodium (HPS)',
      'LED'
    ],
    growSystemNames : [
      'Flood & Drain',
      'NFT (Nutrient Film Technique)',
      'Deep Water Culture (DWC)',
      'Aquaponic'
    ]
  };

  /**
   * Type of sensor log: manual through UI or device sent
   */
  utils.sensorLogTypes = {
    'MANUAL': 'manual',
    'DEVICE': 'device',
    'EXTERNAL': 'external'
  };
  
  /**
   * Checks whether the provided string matches the ObjectId format.
   * Used when checking user-generated _id's, to avoid parse exceptions when passing them to 
   * MongooseModel.findById
   * 
   * @param {string|ObjectId} str. String or object to test for parsability.
   * @return {bool}
   */
  utils.canParseAsObjectId = function(str){
    if (!str) { return false; }
    return /^[0-9a-fA-F]{24}$/.test(str.toString());
  };

  /**
   *
   * @param str
   * @return {*}
   */
  utils.toTitleCase = function(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
      return match.toUpperCase();
    });
  };


  
  /**
   * Get the localized time of day in milliseconds
   * 
   * Relies on browser behavior of giving localized values for date methods
   * 
   * @param {Date} date
   * @return {Number} milliseconds since localized 00:00:00 of the day
   */
  utils.getTimeOfDayInMilliseconds = function(date){
    return ( 
      (date.getHours() * 60 * 60 * 1000) + 
      (date.getMinutes() * 60 * 1000) +
      (date.getSeconds() * 1000)
    );
  };


  /**
   * Get the time of day from milliseconds since 00:00:00
   * 
   * Relies on browser behavior of giving localized values for date methods
   * 
   * @param {Number} milliseconds
   * @return {z`} milliseconds since localized 00:00:00 of the day
   */
  utils.getTimeOfDayFromMilliseconds = function(milliseconds){
    var duration = moment.duration(milliseconds);
    return moment().hour(duration.hours()).minute(duration.minutes()).format("h:mma");
  };  

  /**
   * Generate an array with the times of day in :30 minute increments, along with milliseconds since start of day (00:00)
   */
  utils.generateTimesOfDayArray = function(){
    var result = [], min = 0, hr = 0, minStr, hrStr, hrInc = 0;

    for (; hrInc < 24;){
      hr = Math.floor(hrInc);
      hrStr = (hr < 10 ? '0' + hr : hr);
      hrStr = (hr > 12 ? (hr - 12) : (hr == 0 ? '12' : hr));
      var suffix = (hr < 12 ? 'am' : 'pm');
      minStr = min < 10 ? '0' + min : min;
      result.push({
        "ms": ((min * 60 * 1000) + (hr * 60 * 60 * 1000)),
        "str": hrStr + ':' + minStr + suffix
      });
      min = (min == 0 ? 30 : 0);
      hrInc += .5;
    }
    return result;
  };


  /**
   *
   * @param n
   * @return {Boolean}
   */
  utils.isWholeNumber = function (n) {
    return n % 1 === 0;
  };


  /**
   * Takes a duration and returns the largest unit of time for which the duration is a whole number.
   * Used to simplify presentation of durations in UI (avoiding decimals).
   *
   * @param duration. Number. 
   * @param durationType. String. One of bpn.utils.durationTypes. If omitted, it is assumed to be milliseconds.
   * @return { 'duration' : number, 'durationType' : string }
   */
  utils.getLargestWholeNumberDurationObject = function(duration, durationType){
    var duration = moment.duration(duration, durationType || ''),
      transformedDuration;
    if (utils.isWholeNumber(transformedDuration = duration.asYears())) {
      return {
        duration : transformedDuration,
        durationType : 'years'
      }
    }
    if (utils.isWholeNumber(transformedDuration = duration.asMonths())) {
      return {
        duration : transformedDuration,
        durationType : 'months'
      }
    }
    if (utils.isWholeNumber(transformedDuration = duration.asWeeks())){
      return {
        duration : transformedDuration,
        durationType : 'weeks'
      }
    }
    if (utils.isWholeNumber(transformedDuration = duration.asDays())){
      return {
        duration : transformedDuration,
        durationType : 'days'
      }
    }
    if (utils.isWholeNumber(transformedDuration = duration.asHours())){
      return {
        duration : transformedDuration,
        durationType : 'hours'
      }
    }
    if (utils.isWholeNumber(transformedDuration = duration.asMinutes())){
      return {
        duration : transformedDuration,
        durationType : 'minutes'
      }
    }
    // if all fail, return as seconds
    transformedDuration = duration.asSeconds();
    return {
      duration : transformedDuration,
      durationType : 'seconds'
    }
  };


  utils.getOrdinal = function(number){
    var b = number % 10;
    var output = (~~ (number % 100 / 10) === 1) ? 'th' :
        (b === 1) ? 'st' :
        (b === 2) ? 'nd' :
        (b === 3) ? 'rd' : 'th';
    return number + output;
  };



  /**
   * Assumes a viewModel Action, with action.overallDurationInMilliseconds and action.cycle.states[].durationInMilliseconds
   */
  utils.getCurrentControlStateFromAction = function(action, timeOfDayInMilliseconds){
    var overallDurationInMilliseconds = action.overallDurationInMilliseconds,
        cycleTimeElapsed = timeOfDayInMilliseconds % overallDurationInMilliseconds,
        controlValue = '0',
        states = action.cycle.states;

    switch(action.cycle.states.length) {
      case 0:
        controlValue = '0';
        break;
      case 1:
        controlValue = action.cycle.states[0].controlValue;
        break;
      default:
        if (cycleTimeElapsed < states[0].durationInMilliseconds){
          controlValue = states[0].controlValue;
        } else if (cycleTimeElapsed < (states[0].durationInMilliseconds + states[1].durationInMilliseconds)){
          controlValue = states[1].controlValue;
        } else {
          controlValue = states[0].controlValue;
        }
        break;
    }

    return parseInt(controlValue, 10);
  };

  /**
   * Get the message for the specified cycle state.
   *
   * Used to ensure we have a friendly message for a state even if one wasn't explicitly defined.
   *
   * @param stateIndex {Number} Required.
   */
  utils.getActionCycleStateMessage = function(action, stateIndex){
    var state = action.cycle.states[stateIndex],
        control = action.control,
        controlName = (control ? control.name : '') || 'accessory',
        result;

    if (state.message) {
      return state.message;
    }

    if (state.controlValue){
      result = "Turn " + controlName + " " + (state.controlValue === '0' ? "off" : "on");
    } else {
      // no control, no message. Hopefully there's a duration. It's a waiting state!
      result = "Wait";
    }

    if (state.duration){
      result += " for " + state.duration + " " + state.durationType; 
    }
    
    return result;
  };


  utils.friendlyFormatObjectId = function(objectId){
    return objectId.toString().match(new RegExp('.{1,4}', 'g')).join("-");
  };

  return utils;
});
