var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	mongoosePlugins = require('../lib/mongoose-plugins'),
    useTimestamps = mongoosePlugins.useTimestamps,
  	ObjectId = Schema.ObjectId,
  	ActionModel,
  	ActionSchema,
  	async = require('async'),
  	timezone = require('timezone/loaded'),
  	ControlModel = require('./control').model;

ActionSchema = new Schema({
	
	description: { type: String, required: true },
	
	control: { type: ObjectId, ref: 'Control', required: false },
	
	/**
	 * Action schedules are represented by a cycle. 
	 * Cycles have a series of states. Discreet actions are
	 * those with a "repeat" == false.
	 * 
	 * Actions trigger with phase start. They can be offset
	 * using an intial cycle state with no message or value,
	 * just a duration. 
	 *
	 * Cycles can have 1-3 states. See the pre-save hook below for validation details.
	 * 
	 * Also, all fields are optional. 
	 */
	cycle: {
	
		states: [
			{
				controlValue: { type: String },

				durationType: { type: String, enum: [
					'seconds',
					'minutes',
					'hours',
					'days',
					'weeks',
					'months'
				]},
				
				duration: { type: Number },
				
				message: { type: String }
			}
		],

		repeat: { type: Boolean, default: false }
	}
});

ActionSchema.plugin(useTimestamps);


/**
 * Used by the notification engine to set when actions should expire in 
 * order to recalculate current actions. 
 */
ActionSchema.virtual('overallCycleTimespan')
	.get(function () {
		// default to a 1 year max duration
		var total = 1000 * 60 * 60 * 24 * 365,
			cycle = this.cycle,
			states;

		if (!cycle || !cycle.states.length){ return total; }

		states = cycle.states;
		switch(states.length){
			case 1:
				// Single-state cycle. Infinite (aka, 1-year expiration)
				break;
			case 2:
			case 3:
				total = 0;
				states.forEach(function(state){
					total += ActionUtils.convertDurationToMilliseconds(state.durationType, state.duration);
				});
				break;
				// no default; we've enforced that we have one of these values already
		}
		return total;
	});


/************************** INSTANCE METHODS ***************************/


/************************** END INSTANCE METHODS ***************************/




/************************** STATIC METHODS ***************************/

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
	
	if (!cycle.states.length){ return next(); }

	states = cycle.states;
	
	if ((states.length > 3)){
		return next(new Error('Invalid number of cycle states'));
	}
	
	switch(states.length){
		case 1:
			// if a cycle has 1 state, it's considered a discrete action and must have a "repeat" of false
			// TODO : should this throw an error or just set the correct value silently?
			if (cycle.repeat){
				return next(new Error('Actions with single-state cycles are considered discrete actions and cannot have "repeat" set to true'));
			}
			break;
		case 2:
			// if 2 states, at least one must have a duration defined
			if ( !(states[0].durationType && states[0].duration) &&
				 !(states[1].durationType && states[1].duration)){
				return next(new Error('In a 2-state cycle, at least one state must have a duration defined'));
			}
			break;
		case 3:
			// if a cycle has 3 states, the 1st and 3rd must have the same control value
			if (states[0].controlValue !== states[2].controlValue){
				return next(new Error('First and last control values must be equal'));
			}
			// and either the (1st & 3rd) or 2nd states must have durations defined
			if (!(
					(
						(states[0].durationType && states[0].duration) &&
				  	(states[2].durationType && states[2].duration)
			  	) 
				  ||
				  (states[1].durationType && states[1].duration)
			   )){
				return next(new Error('In a 3-state cycle, either the (1st and 3rd) or the 2nd state must have a duration defined'));
			}	
			break;
		// no default; we've enforced that we have one of these values already
	}

  	next();
});

/************************** END MIDDLEWARE ***************************/


/**
 * Now that schema is defined, add indices
 */
 // Want a sparse index on control (since it's an optional field)
ActionSchema.index({ control: 1, 'cycle.repeat': 1 }, { sparse: true});


ActionModel = mongoose.model('Action', ActionSchema);




/**
 * Utilities
 *
 */
var ActionUtils = {
	convertDurationToMilliseconds : function(durationType, duration){
		switch(durationType){
			case 'milliseconds':
				return duration;
			case 'seconds':
				return duration * 1000;
			case 'minutes':
				return duration * 1000 * 60;
			case 'hours':
				return duration * 1000 * 60 * 60;
			case 'days':
				return duration * 1000 * 60 * 60 * 24;
			case 'weeks':
				return duration * 1000 * 60 * 60 * 24 * 7;
			case 'months':
				// TODO : Figure out a proper way to handle month-long durations. variable day spans.
				return duration * 1000 * 60 * 60 * 24 * 30;
			case 'untilPhaseEnd':
			default:
				// an infinite duration.
				return -1;
		}
	},


	getCycleRemainder : function(growPlanInstancePhase, action, userTimezone){
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
	},

	

	/**
	 * Parses cycles and returns simplified 1 or 2 state object, with an offset if necessary.
	 * 
	 * @param offset. Only a factor in a 3-state cycle, where we need to pull it back by the duration of the 3rd state
	 *                Otherwise it's just written straight to the template.
	 */
	getSimplifiedCycleFormat : function(actionCycleStates, offset){
		var states = actionCycleStates,
			convertDurationToMilliseconds = ActionUtils.convertDurationToMilliseconds,
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
				result.duration1 = convertDurationToMilliseconds(state0.durationType, state0.duration);
				result.value2 = state1.controlValue;
				result.duration2 = convertDurationToMilliseconds(state1.durationType, state1.duration);
				break;
			case 3:
				// If a 3-state cycle, the 1st and 3rd are assumed to be contiguous (have the same controlValue)

				var state0 = states[0],
					state1 = states[1],
					state2 = states[2],
					firstDuration = convertDurationToMilliseconds(state0.durationType, state0.duration),
					thirdDuration = convertDurationToMilliseconds(state2.durationType, state2.duration),
					totalFirstDuration = firstDuration + thirdDuration;
				
				// for a 3-state cycle, offset should effectively subtract 3rd state from the totalFirstDuration
				// and if we got an offset passed in, add that 
				result.offset = offset + thirdDuration;
				result.value1 = state0.controlValue;
				result.duration1 = totalFirstDuration;
				result.value2 = state1.controlValue;
				result.duration2 = convertDurationToMilliseconds(state1.durationType, state1.duration);
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
	},


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
	updateCycleTemplateWithStates : function(cycleTemplate, actionCycleStates, offset){
		var result = ActionUtils.getSimplfiedCycleFormat(actionCycleStates, offset),
			resultCycleString = cycleTemplate;

		resultCycleString = resultCycleString.replace(/{offset}/, result.offset);
		resultCycleString = resultCycleString.replace(/{value1}/, result.value1);
		resultCycleString = resultCycleString.replace(/{duration1}/, result.duration1);
		resultCycleString = resultCycleString.replace(/{value2}/, result.value2);
		resultCycleString = resultCycleString.replace(/{duration2}/, result.duration2);
		result.cycleString = resultCycleString;

		return result;
	}
};


exports.schema = ActionSchema;
exports.model = ActionModel;
exports.utils = ActionUtils;
