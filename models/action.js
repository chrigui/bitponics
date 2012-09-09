var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var ActionSchema = new Schema({
	
	description: { type: String, required: true },
	
	control: { type: ObjectId, ref: 'Control'},
	
	cycle: {
	
		states: [
			{
				controlValue: { type: String},

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

		/**
		 * undefined means repeat infinitely.
		 */
		stopAfterRepetitionCount: { type: Number }
	}
});

ActionSchema.plugin(useTimestamps);

exports.schema = ActionSchema;
exports.model = mongoose.model('Action', ActionSchema);