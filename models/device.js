var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var DeviceSchema = new Schema({
	name : { type: String, required: false },
	users : [ { type: ObjectId, ref: 'User', required: true }],
	sensors : [ { type: ObjectId, ref: 'Sensor', required: true }],
	controlMap : [ 
		{ 
			control : { type: ObjectId, ref: 'Control' },
			outletId : { type: String }
		}
	]
});

DeviceSchema.plugin(useTimestamps);

exports.schema = DeviceSchema;
exports.model = mongoose.model('Device', DeviceSchema);