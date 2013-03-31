var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	ObjectIdSchema = Schema.ObjectId;

var SensorMapSchema = new Schema({
  sensor : { type: ObjectIdSchema, ref: 'Sensor', required : true },
  inputId : { type: String, required : true }
},
{ id : false, _id : false });

var OutputMapSchema = new Schema({
  control : { type: ObjectIdSchema, ref: 'Control', required : true },
  outputId : { type: String, required : true }
},
{ id : false, _id : false });


var DeviceTypeSchema = new Schema({
	name: { type: String, required: true }, //‘Bitponics Beta Device 1’
	firmwareVersion: { type: String, required: true }, //‘0.1’
	microprocessor: { type: String },
	sensorMap : [ SensorMapSchema ],
  outputMap : [ OutputMapSchema ]
},
{ id : false });

DeviceTypeSchema.plugin(useTimestamps);

exports.schema = DeviceTypeSchema;
exports.model = mongoose.model('DeviceType', DeviceTypeSchema);