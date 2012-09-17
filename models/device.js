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
	    inputId : { type: String }
	  }
	],
	controlMap : [ 
	  { 
	    control : { type: ObjectId, ref: 'Control' },
	    outputId : { type: String }
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

/**
 * Add indexes. Probably wise to do it here after all the fields have been added
 *
 */



/**
 *  If sensorMap is undefined then use the deviceType's default sensorMap
 */
DeviceSchema.pre('save', function(next){
	var device = this;
	if(device.sensorMap){ return next(); }

	DeviceTypeModel.findOne({ _id: device.deviceType }, function(err, deviceType){
		if (err) { return next(err); }
		device.sensorMap = deviceType.sensorMap;
		next();
	});
});

/**
 *  If controlMap is undefined then use the deviceType's default controlMap
 */
DeviceSchema.pre('save', function(next){
	var device = this;
	if(device.controlMap){ return next(); }

	DeviceTypeModel.findOne({ _id: device.deviceType }, function(err, deviceType){
		if (err) { return next(err); }
		device.controlMap = deviceType.controlMap;
		next();
	});
});

exports.schema = DeviceSchema;
exports.model = mongoose.model('Device', DeviceSchema);