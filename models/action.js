var mongoose = require('mongoose'),
  mongooseTypes = require('mongoose-types'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId,
  mongoosePlugins = require('../lib/mongoose-plugins'),
  useTimestamps = mongoosePlugins.useTimestamps,
  async = require('async'),
  timezone = require('timezone/loaded'),
  moment = require('moment'),
  getObjectId = require('./utils').getObjectId,
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils'),
  i18nKeys = require('../i18n/keys'),
  ActionModel,
  ActionSchema;


/**
 * Internal schema used for Action. Declared as its own Schema simply to remove unnecessary _id prop
 * @type {Schema}
 */
var ActionStateSchema = new Schema(
  {
    controlValue: { type: String },

    durationType: { type: String, enum: feBeUtils.DURATION_TYPES},

    duration: { type: Number },

    message: { type: String }
  },
  { _id : false, id : false }
);


ActionSchema = new Schema({

  description: { type: String, required: true },

  control: { type: ObjectId, ref: 'Control', required: false },

  /**
   * Action schedules are represented by a cycle.
   * Cycles have a series of states. Discreet actions are
   * those with a "repeat" == false.
   *
   * Actions trigger with phase start. They can be offset
   * using an initial cycle state with no message or value,
   * just a duration.
   *
   * Cycles can have 1-3 states. See the pre-save hook below for validation details.
   *
   * Also, all fields are optional.
   *
   * The cycle itself is also optional. If undefined, the Action is considered a simple "reminder"
   */
  cycle: {
    states: [ActionStateSchema],

    repeat: { type: Boolean }
  }
});

ActionSchema.plugin(useTimestamps);


/**
 * Used by the notification engine to set when actions should expire in
 * order to recalculate current actions.
 *
 * @return Number. Cycle timespan in milliseconds.
 */
ActionSchema.virtual('overallCycleTimespan')
  .get(function () {
    // default to a 1 year max duration
    var total = moment.duration(1, 'year').asMilliseconds(), //1000 * 60 * 60 * 24 * 365,
      cycle = this.cycle,
      states;

    if (!cycle || !cycle.states.length){ return total; }

    states = cycle.states;
    switch(states.length){
      case 1:
        // Single-state cycle. If it has a control, it's considered to be a one-time
        // trigger that should last until explicitly changed, which means it's effectively
        // an infinite duration. we can "infinite" at 1-year.
        if (this.control){
          return total;
        } else {
          return 0;
        }

        // if no control, it's just a message notification (aka, a reminder).
        // no duration
        break;
      case 2:
      case 3:
        total = 0;
        states.forEach(function(state){
          total += ActionSchema.statics.convertDurationToMilliseconds(state.duration, state.durationType);
        });
        break;
      // no default; we've enforced that we have one of these values already
    }
    return total;
  });


/************************** INSTANCE METHODS ***************************/

/**
 * Get the message for the specified cycle state.
 *
 * Used primarily to generate a message for a control trigger when there
 * is no explicit message defined.
 *
 * @param stateIndex {Number} Required.
 * @param controlName {String} optional. If no explicit message is defined, and there is a control defined, this param
 * 		  will be interpolated into the message. Needs to be passed in because we can't assume a populated Control object
 */
ActionSchema.method('getStateMessage', function(stateIndex, controlName){
  var state = this.cycle.states[stateIndex];

  if (state.message) {
    return state.message;
  }
  if (state.controlValue){
    return 'Turn ' + (controlName ? (controlName + ' ') : '') +
           (state.controlValue == '0' ? 'off' : 'on') +
           (state.duration ? (' for ' + state.duration + ' ' + state.durationType) : '');
  }
  return '';
});


/************************** END INSTANCE METHODS ***************************/




/************************** STATIC METHODS ***************************/

/**
 * Given another Action object, determine whether they're equivalent.
 * Compares most properties, ignoring Action._id and Action.cycle.states._id.
 *
 * Synchronous.
 *
 * @param source {Action}. Action model object
 * @param other {Action}. Action model object
 * @return {boolean}. true if the objects are equivalent, false if not
 */
ActionSchema.static('isEquivalentTo', function(source, other){
  if (source.description !== other.description){
    return false;
  }

  if (!((source.control && other.control) || (!source.control && !other.control))) {
    return false;
  }
  if (source.control){
    if (!getObjectId(source.control).equals(getObjectId(other.control))){
      return false;
    }
  }

  if (source.cycle.states.length !== other.cycle.states.length){
    return false;
  }

  if (source.cycle.repeat !== other.cycle.repeat){
    return false;
  }

  var allStatesEquivalent = source.cycle.states.every(function(state, index){
    var otherState = other.cycle.states[index];
    if (state.controlValue !== otherState.controlValue) {
      return false;
    }
    if (state.durationType !== otherState.durationType) {
      return false;
    }
    if (state.duration !== otherState.duration) {
      return false;
    }
    if (state.message !== otherState.message) {
      return false;
    }
    return true;
  });

  if (!allStatesEquivalent) { return false; }

  return true;
});


/**
 *
 */
ActionSchema.static('convertDurationToMilliseconds', function(duration, durationType){
  switch(durationType){
    case 'milliseconds':
    case 'seconds':
    case 'minutes':
    case 'hours':
    case 'days':
    case 'weeks':
    case 'months':
      return moment.duration(duration, durationType).asMilliseconds();
    default:
      return 0;
  }
});


/**
 *
 */
ActionSchema.static('getCycleRemainder', function(growPlanInstancePhase, action, userTimezone){
  // http://en.wikipedia.org/wiki/Date_%28Unix%29
  // get the overall timespan of the cycle.
  // get the localized 00:00:00 of the phase start date (phase could have started later in the day, we need the day's start time)
  // get time elapsed from localized phase start
  // divide time elapsed by overall timespan. remainder is a component of the offset
  var now = new Date(),
    phaseStartDateParts = timezone(growPlanInstancePhase.startDate, userTimezone, '%T').split(':'),
  // get the midnight of the start date
    phaseStartDate = growPlanInstancePhase.startDate - ( (phaseStartDateParts[0] * 60 * 60 * 1000) + (phaseStartDateParts[1] * 60 * 1000) + (phaseStartDateParts[2] * 1000)),
    overallCycleTimespan = action.overallCycleTimespan,
    phaseTimeElapsed = now - phaseStartDate,
    cycleRemainder = phaseTimeElapsed % overallCycleTimespan;

  return cycleRemainder;
});



/**
 * Parses cycles and returns simplified 1 or 2 state object, with an offset if necessary.
 *
 * @param offset. Only a factor in a 3-state cycle, where we need to pull it back by the duration of the 3rd state
 *                Otherwise it's just written straight to the template.
 *
 * @return {Object}. { offset: Number, value1: Number, duration1: Number, value2: Number, duration2: Number }
 */
ActionSchema.static('getSimplifiedCycleFormat', function(actionCycleStates, offset){
  var states = actionCycleStates,
    convertDurationToMilliseconds = ActionSchema.statics.convertDurationToMilliseconds,
    offset = offset || 0,
    result = {
      offset : 0,
      value1 : 0,
      duration1 : 0,
      value2 : 0,
      duration2 : 0
    };

  switch(states.length){
    case 1:
      var infiniteStateControlValue = states[0].controlValue;
      result.offset = offset;
      result.value1 = infiniteStateControlValue;
      result.duration1 = 1;
      result.value2 = infiniteStateControlValue;
      result.duration2 = 1;
      break;
    case 2:
      var state0 = states[0],
        state1 = states[1];

      result.offset = offset;
      result.value1 = state0.controlValue;
      result.duration1 = convertDurationToMilliseconds(state0.duration, state0.durationType);
      result.value2 = state1.controlValue;
      result.duration2 = convertDurationToMilliseconds(state1.duration, state1.durationType);
      break;
    case 3:
      // If a 3-state cycle, the 1st and 3rd are assumed to be contiguous (have the same controlValue)

      var state0 = states[0],
        state1 = states[1],
        state2 = states[2],
        firstDuration = convertDurationToMilliseconds(state0.duration, state0.durationType),
        thirdDuration = convertDurationToMilliseconds(state2.duration, state2.durationType),
        totalFirstDuration = firstDuration + thirdDuration;

      // for a 3-state cycle, offset should effectively subtract 3rd state from the totalFirstDuration
      // and if we got an offset passed in, add that
      result.offset = offset + thirdDuration;
      result.value1 = state0.controlValue;
      result.duration1 = totalFirstDuration;
      result.value2 = state1.controlValue;
      result.duration2 = convertDurationToMilliseconds(state1.duration, state1.durationType);
      break;
    default:
      winston.info('Serializing a blank actionCycleState');
      result.offset = 0;
      result.value1 = 0;
      result.duration1 = 0;
      result.value2 = 0;
      result.duration2 = 0;
      break;
  }
  return result;
});


/**
 * Takes a string with the tokens {offset},{value1},{duration1},{value2},{duration2}
 * and replaces each field with the proper values. Offset is returned in milliseconds.
 *
 * Assumes it's passed an action with states with controlValues.
 *
 * @param offset. Only a factor in a 3-state cycle, where we need to pull it back by the duration of the 3rd state
 *                Otherwise it's just written straight to the template.
 * @return Object. {cycleString, offset, value1, duration1, value2, duration2}
 */
ActionSchema.static('updateCycleTemplateWithStates', function(cycleTemplate, actionCycleStates, offset){
  var result = ActionSchema.statics.getSimplifiedCycleFormat(actionCycleStates, offset),
    resultCycleString = cycleTemplate;

  resultCycleString = resultCycleString.replace(/{offset}/, result.offset);
  resultCycleString = resultCycleString.replace(/{value1}/, result.value1);
  resultCycleString = resultCycleString.replace(/{duration1}/, result.duration1);
  resultCycleString = resultCycleString.replace(/{value2}/, result.value2);
  resultCycleString = resultCycleString.replace(/{duration2}/, result.duration2);
  result.cycleString = resultCycleString;

  return result;
});

/************************** END STATIC METHODS***************************/


/************************** MIDDLEWARE ***************************/

/**
 *  Validate cycle states
 *
 *  A cycle either represents a discrete action or a pair of states.
 *
 *  Cycles always start with the start of a phase, and
 *  phases always start at the start of a day (at 00:00:00) local time.
 *
 *  An "offset" cycle, like a 16-hour light cycle that starts at 6am,
 *  is represented with 3 states, with the 1st and 3rd having the same value.
 */
ActionSchema.pre('save', function(next){
  var action = this,
    cycle = action.cycle,
    states;

  // An Action can have no cycle. In this case it's a simple reminder.
  if (!cycle.states.length){
    if (this.control){
      return next(new Error(i18nKeys.get('An action with a control must define a cycle with 1 or more control states')));
    }
    // make sure cycle.repeat doesn't exist, since it doesn't need to
    delete this.cycle.repeat;
    return next();
  }

  states = cycle.states;

  if ((states.length > 3)){
    return next(new Error(i18nKeys.get('Invalid number of cycle states')));
  }

  if (action.control){
    if (states.some(function(state){
      return (typeof state.controlValue === 'undefined' || state.controlValue === null);
    })){
      return next(new Error(i18nKeys.get('If an action has a control, every cycle state must specify a control value')));
    }
  }

  switch(states.length){
    case 1:
      // if a cycle has 1 state, it's considered a discrete action and must have a "repeat" of false
      delete this.cycle.repeat;
      break;
    case 2:
      // if 2 states, at least one must have a duration defined
      if ( !(states[0].durationType && states[0].duration) &&
           !(states[1].durationType && states[1].duration)){
        return next(new Error(i18nKeys.get('In a 2-state cycle, at least one state must have a duration defined')));
      }
      break;
    case 3:
      // if a cycle has 3 states, the 1st and 3rd must have the same control value & message
      if (states[0].controlValue !== states[2].controlValue){
        return next(new Error(i18nKeys.get('First and last control values must be equal')));
      }
      if (states[0].message !== states[2].message){
        return next(new Error(i18nKeys.get('First and last state\'s messages must be equal')));
      }
      // and at least the 1st & 3rd states must have durations defined
      if (!(
        (states[0].durationType && states[0].duration) &&
        (states[2].durationType && states[2].duration)
        )
        ){
        return next(new Error(i18nKeys.get('In a 3-state cycle, at least the 1st and 3rd states must have durations defined')));
      }
      break;
    // no default; we've enforced that we have one of these values already
  }

  return next();
});

/************************** END MIDDLEWARE ***************************/


/**
 * Now that schema is defined, add indices
 */
  // Want a sparse index on control (since it's an optional field)
ActionSchema.index({ control: 1, 'cycle.repeat': 1 }, { sparse: true});

ActionModel = mongoose.model('Action', ActionSchema);


exports.schema = ActionSchema;
exports.model = ActionModel;