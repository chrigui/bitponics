var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var LightSchema = new Schema({
	name: { type: String, required: true, enum: [
		'fluorescent',
		'metal halide',
		'none',
		'high pressure sodium (HPS)',
		'mixed'
	]},
	wattage: { type: Number }
});

LightSchema.plugin(useTimestamps);

LightSchema.suggestions = {
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

exports.schema = LightSchema;
exports.model = mongoose.model('Light', LightSchema);
