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
	userAssignments : [
		{
			timestamp : { type : Date, default: Date.now, required : true},
			user : { type : ObjectId, ref: 'User', required: true },
			assignmentType: { type : String, enum : ['owner', 'member']}
		}
	],
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
	recentSensorLogs : [{
		timestamp: { type: Date, required: true, default: Date.now },
		logs : [{
			// sCode references Sensor.code
			sCode: { type: String, ref: 'Sensor', required: true },
			value: { type: Number }
		}]
	}],
	activeGrowPlanInstance : {type: ObjectId, ref: 'GrowPlanInstance', required:false},
	activePhase : {type: ObjectId, ref: 'GrowPlanInstance', required:false },
	activeActions : {
		actions : [{type: ObjectId, ref: 'Action'}],
		deviceMessage : String,
		lastSent : Date,
		expires : Date,
		deviceRefreshRequired : { type: Boolean, default: true }
	},
	/**
	 * activeActionOverrides are any automatically or manually triggered actions. 
	 * They override the phase cycles until they expire.
	 */
	activeActionOverrides : {
		actions: [{type: ObjectId, ref: 'Action'}],
		deviceMessage : String,
		lastSent: Date,
		expires : Date
	}
});

DeviceSchema.plugin(useTimestamps);

/**
 * Add indexes. Probably wise to do it here after all the fields have been added
 *
 */



/**
 *  HACK : if DeviceType is unassigned, assign it the 'Bitponics Beta Device 1' DeviceType
 *  In production, every device produced should actually get a database entry. And maybe 
 *  we should have a blank deviceType or something as fallback
 */
DeviceSchema.pre('save', function(next){
	var device = this;
	if(device.deviceType){ return next(); }

	DeviceTypeModel.findOne({ name: 'Bitponics Beta Device 1' }, function(err, deviceType){
		if (err) { return next(err); }
		device.deviceType = deviceType;
		next();
	});
});

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



var deviceUtils = {
	cycleTemplate : '{outputId},{override},{offset},{value1},{duration1},{value2},{duration2};'
};

exports.schema = DeviceSchema;
exports.model = mongoose.model('Device', DeviceSchema);
exports.utils = deviceUtils;