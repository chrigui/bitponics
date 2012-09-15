var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var ActionSchema = new Schema({
	
	description: { type: String, required: true },
	
	control: { type: ObjectId, ref: 'Control'},

	controlMessage: {
		controlReference : { type: ObjectId, ref: 'Light'},
		valueToSend: { type: Number, required: true }
	},

	startTime: { type: Number, required: true }, //this is offset, so 0 = trigger as soon as the phase starts

	cycle: {
		states: [
			{
				controlValue: { type: String},
				duration: { type: Number },
				message: { type: String }
			}
		],
		stopAfterRepetitionCount: { type: Number },
	},

	recurrence: {
		repeatType: { type: String },
		frequency: { type: Number },
		numOfTimes: { type: Number }
	}
});

ActionSchema.plugin(useTimestamps);

exports.schema = ActionSchema;
exports.model = mongoose.model('Action', ActionSchema);