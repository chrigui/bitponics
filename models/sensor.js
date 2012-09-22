var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
  	ObjectId = Schema.ObjectId;

var SensorSchema = new Schema({
	name: { type: String, required: true },
	abbrev: {type: String },
	unit: { type: String, required: true },
	code: { type: String, required: true, unique: true }
});

SensorSchema.plugin(useTimestamps);

exports.schema = SensorSchema;
exports.model = mongoose.model('Sensor', SensorSchema);