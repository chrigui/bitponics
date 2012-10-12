var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
  	ObjectId = Schema.ObjectId;

var DeviceTypeSchema = new Schema({
	name: { type: String, required: true }, //‘Bitponics Beta Device 1’
	firmwareVersion: { type: String, required: true }, //‘0.1’
	microprocessor: { type: String, required: true },
	sensorMap: [{
		inputId: { type: String, required: true }, //‘ph’
		sensor : { type: ObjectId, ref: 'Sensor', required: true }
	}],
	controlMap : [{
		outputId: { type: String, required: true }, //‘ph’
		control : { type: ObjectId, ref: 'Control', required: true }	
	}]
});

DeviceTypeSchema.plugin(useTimestamps);

exports.schema = DeviceTypeSchema;
exports.model = mongoose.model('DeviceType', DeviceTypeSchema);