var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var SensorSchema = new Schema({
	
	name: { type: String, required: true },
	
	/**
	 * 
	 */
	unitOfMeasurement: { type: String, required: true }
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