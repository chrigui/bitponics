var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId,
  	DeviceTypeModel = require('./deviceType').model;

var DeviceSchema = new Schema({
	id: { type: String, required: true, unique: true }, //mac address
	deviceType: { type: ObjectId, ref: 'DeviceType', required: true },
	name : { type: String },
	users : [ { type: ObjectId, ref: 'User', required: true }],
	sensorMap : [
      { 
	    sensor : { type: ObjectId, ref: 'Sensor' },
	    outletId : { type: String }
	  }
	],
	controlMap : [ 
	  { 
	    control : { type: ObjectId, ref: 'Control' },
	    outletId : { type: String }
	  }
	]
});

DeviceSchema.plugin(useTimestamps);

DeviceSchema.pre('save', function(next){
  var device = this;

  //if sensorMap is undefined then use the deviceType's default sensorMap
  if(!device.sensorMap){
  	DeviceTypeModel.findOne({ _id: device.deviceType }, function(err, deviceType){
  		if(!err){
  			device.sensorMap = deviceType.sensorMap;
  			next();
  		}
  	});
  }
});

exports.schema = DeviceSchema;
exports.model = mongoose.model('Device', DeviceSchema);