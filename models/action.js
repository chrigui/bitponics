var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	mongoosePlugins = require('../lib/mongoose-plugins'),
    useTimestamps = mongoosePlugins.useTimestamps,
  	ObjectId = Schema.ObjectId,
  	ActionModel,
  	ActionSchema,
  	async = require('async');

ActionSchema = new Schema({
	
	description: { type: String, required: true },
	
	control: { type: ObjectId, ref: 'Control', required: false },
	
	/**
	 * Action schedules are represented by a cycle. 
	 * Cycles have a series of states. Discreet actions are
	 * those with a "stopAfterReptitionCount" of 1.
	 * 
	 * Actions trigger with phase start. They can be offset
	 * using an intial cycle state with no message or value, j
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
					'milliseconds',
					'seconds',
					'minutes',
					'hours',
					'days',
					'weeks',
					'months',
					'untilPhaseEnd'
				]},
				
				duration: { type: Number },
				
				message: { type: String }
			}
		],

		repeat: { type: Boolean, default: false }
	}
});

ActionSchema.plugin(useTimestamps);

ActionSchema.statics.convertDurationToMilliseconds = function(durationType, duration, callback){
	switch(durationType){
		case 'milliseconds':
			return callback(null, duration);
			break;
		case 'seconds':
			return callback(null, duration * 1000);
			break;
		case 'minutes':
			return callback(null, duration * 1000 * 60);
			break;
		case'hours':
			return callback(null, duration * 1000 * 60 * 60);
			break;
		case 'days':
			return callback(null, duration * 1000 * 60 * 60 * 24);
			break;
		case 'weeks':
			return callback(null, duration * 1000 * 60 * 60 * 24 * 7);
			break;
		case 'months':
			// TODO : Figure out a proper way to handle month-long durations. variable day spans.
			return callback(null, duration * 1000 * 60 * 60 * 24 * 30);
			break;
		case 'untilPhaseEnd':
		default:
			return callback(new Error('Cannot convert the durationType' + durationType + ' to milliseconds'))
	}
};

ActionSchema.methods.getStatesInDeviceFormat = function(finalCallback){
	var action = this,
		states = action.cycle.states,
		resultArray = [],
		convertDurationToMilliseconds = ActionModel.convertDurationToMilliseconds;

	switch(states.length){
		case 1:
			return finalCallback(new Error('Cannot convert single-state cycle to device format'));
			break;
		case 2:
			var state0 = states[0],
				state1 = states[1];
			
			async.series([
				function(callback){
					resultArray.push(state0.controlValue + ',');
					convertDurationToMilliseconds(
						state0.durationType, 
						state0.duration, 
						function(err, duration){
							if (err) { return callback(err);}
							resultArray.push(duration + ',');
							callback();		
						});
				},
				function(callback){
					resultArray.push(state1.controlValue + ',');
					convertDurationToMilliseconds(
						state1.durationType, 
						state1.duration, 
						function(err, duration){
							if (err) { return callback(err);}
							resultArray.push(duration);
							callback();		
						}
					);	
				}
				], 
				function(err, result){ 
					if (err) { return callback(err);} 
					return finalCallback(null, resultArray.join(''));
				}
			);
			
			break;
		case 3:
			var state0 = states[0],
				state1 = states[1],
				state2 = states[2],
				firstDuration;
			
			// If a 3-state cycle, the 1st and 3rd must be contiguous, so they
			async.series([
				function(callback){
					convertDurationToMilliseconds(
						state0.durationType, 
						state0.duration, 
						function(err, duration){
							if (err) { return callback(err);}
							firstDuration = duration;
							callback();		
						}
					);
				},
				function(callback){
					convertDurationToMilliseconds(
						state2.durationType, 
						state2.duration, 
						function(err, duration){
							if (err) { return callback(err);}
							firstDuration += duration;
							resultArray.push(state0.controlValue + ',');
							resultArray.push( firstDuration + ',');	
							callback();		
						}
					);
				},
				function(callback){
					resultArray.push(state1.controlValue + ',');
					convertDurationToMilliseconds(
						state1.durationType, 
						state1.duration, 
						function(err, duration){
							if (err) { return callback(err);}
							resultArray.push(duration);
							callback();		
						});	
				}
				], 
				function(err, result){ 
					if (err) { return callback(err);} 
					return finalCallback(null, resultArray.join(''));
				}
			);
			break;
	}
};

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

	// if a cycle has 3 states, the 1st and 3rd must have the same control value
	switch(states.length){
		case 1:
			break;
		case 2:
			break;
		case 3:
			if (states[0].controlValue !== states[2].controlValue){
				return next(new Error('First and last control values must be equal'))
			}
			break;
		// no default; we've enforced that we have one of these values already
	}

  	next();
});

ActionModel = mongoose.model('Action', ActionSchema);

exports.schema = ActionSchema;
exports.model = ActionModel;