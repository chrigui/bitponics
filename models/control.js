var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var ControlSchema = new Schema({
	name: { type: String, required: true }
});

ControlSchema.plugin(useTimestamps);

ControlSchema.suggestions = {
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

exports.schema = ControlSchema;
exports.model = mongoose.model('Control', ControlSchema);
