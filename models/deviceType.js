var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	ObjectIdSchema = Schema.ObjectId;

var DeviceTypeSchema = new Schema({
	name: { type: String, required: true }, //‘Bitponics Beta Device 1’
	firmwareVersion: { type: String, required: true }, //‘0.1’
	microprocessor: { type: String },
	sensorMap: [{
		inputId: { type: String, required: true }, //‘ph’
		sensor : { type: ObjectIdSchema, ref: 'Sensor', required: true }
	}],
	controlMap : [{
		outputId: { type: String, required: true }, //‘ph’
		control : { type: ObjectIdSchema, ref: 'Control', required: true }	
	}]
},
{ id : false });

DeviceTypeSchema.plugin(useTimestamps);

exports.schema = DeviceTypeSchema;
exports.model = mongoose.model('DeviceType', DeviceTypeSchema);