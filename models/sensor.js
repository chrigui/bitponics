var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
  	ObjectId = Schema.ObjectId;

var SensorSchema = new Schema({
	name: { type: String, required: true },
	abbrev: {type: String },
	unitOfMeasurement: { type: String, required: true },
	code: { type: String, required: true }
});

SensorSchema.plugin(useTimestamps);

SensorSchema.suggestions = {
	name: [
		'Brightness',
		'pH',
		'EC (Electrical Connectivity)',
		'TDS (Total Disolved Solids)',
		'Water Temperature',
		'Air Temperature',
		'Humidity',
		'Water Level'
	]
}

exports.schema = SensorSchema;
exports.model = mongoose.model('Sensor', SensorSchema);