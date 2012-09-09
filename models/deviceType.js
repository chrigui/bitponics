var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var DeviceTypeSchema = new Schema({
	name: { type: String, required: true }, //‘Bitponics Beta Device 1’
	firmwareVersion: { type: Number, required: true }, //‘0.1’
	microprocessor: { type: String, required: true },
	sensorMap: [{
		outputId: { type: String, required: true }, //‘ph’
		sensor : { type: ObjectId, ref: 'Sensor', required: true }
	}]
});

DeviceTypeSchema.plugin(useTimestamps);

exports.schema = DeviceTypeSchema;
exports.model = mongoose.model('DeviceType', DeviceTypeSchema);