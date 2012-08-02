var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var ActionSchema = new Schema({
	message: { type: String, required: true },
	controlTrigger: {
		control: { type: ObjectId, ref: 'Control', required: true },
		value: { type: Number } //0-255?
	},
	relativeStartTime: { type: Number },
	recurrence: {
		repeatType: { type: String, enum: {
			'minutes',
			'hours',
			'days',
			'weeks',
			'months'
		},
		frequency: { type: Number },
		repeatNumberOfTimes: { type: Number }
	}
});

ActionSchema.plugin(useTimestamps);

ActionSchema.suggestions = {
	// 'name': [
	// 	'Brightness',
	// 	'pH',
	// 	'EC (Electrical Connectivity)',
	// 	'TDS (Total Disolved Solids)',
	// 	'Water Temperature',
	// 	'Air Temperature',
	// 	'Humidity',
	// 	'Water Level'
	// ]
}

exports.schema = ActionSchema;
exports.model = mongoose.model('Action', ActionSchema);