var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
  	ObjectId = Schema.ObjectId,
  	DeviceTypeModel = require('./deviceType').model;

var DeviceSchema = new Schema({
	deviceId: { type: String, required: true, unique: true }, //mac address
	deviceType: { type: ObjectId, ref: 'DeviceType', required: false },
	name : { type: String },
	owner : { type: ObjectId, ref: 'User', required: true},
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
	],
	recentSensorLogs : [
		{
			sensor: { type: ObjectId, ref: 'Sensor', required: true },
			value: { type: Number },
			//timestamp: { type: Date, required: true }
			timestamp: { type: Date, required: true, default: Date.now }
		}
	]
});

DeviceSchema.plugin(useTimestamps);

// DeviceSchema.pre('save', function(next){
//   var device = this;
//   console.log('device:')
//   console.log(device)
//   //if sensorMap is undefined then use the deviceType's default sensorMap
//   if(!device.sensorMap){
//   	DeviceTypeModel.findOne({ _id: device.deviceType }, function(err, deviceType){
//   		if(!err){
//   			console.log('device.sensorMap:');
//   			console.log(device.sensorMap);
//   			device.sensorMap = deviceType.sensorMap;
//   			console.log('deviceType.sensorMap:');
//   			console.log(deviceType.sensorMap);
//   			console.log('device.sensorMap:');
//   			console.log(device.sensorMap);
//   			next();
//   		}else{
//   			console.log('err: '+err)
//   		}
//   	});
//   }else{
//   	next();
//   }
// });

exports.schema = DeviceSchema;
exports.model = mongoose.model('Device', DeviceSchema);