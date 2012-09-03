var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var DeviceSchema = new Schema({
	id: { type: String, required: true, unique: true }, //mac address
	deviceType: { type: ObjectId, ref: 'DeviceType', required: true },
	name : { type: String },
	users : [ { type: ObjectId, ref: 'User', required: true }],
	sensorMap : [],
	controlMap : [ 
	  { 
	    control : { type: ObjectId, ref: 'Control' },
	    outletId : { type: String }
	  }
	]
});

DeviceSchema.plugin(useTimestamps);

DeviceSchema.pre('save', function(next){
  //TODO: preload default sensorMap if no sensorMap defined
  next();
});

exports.schema = DeviceSchema;
exports.model = mongoose.model('Device', DeviceSchema);