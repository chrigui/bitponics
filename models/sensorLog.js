var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	SensorLogModel;


/**
 * SensorReading
 */
var SensorReadingSchema = new Schema({
	/**
	 * s references to Sensor.code
	 */
	s: { type: String, ref: 'Sensor', required: true },
	/**
	 * Value of the sensor reading
	 */
	v: { type: Number }
},
/**
 * Prevent the _id property since these will only ever be subdocs in SensorLog, don't need 
 * ObjectIds created on them
 */
{ _id : false, id : false } );

SensorReadingSchema.virtual('sCode')
	.get(function () {
	  return this.s;
	})
	.set(function (sensorCode){
		this.s = sensorCode;
	});

SensorReadingSchema.virtual('val')
	.get(function () {
	  return this.v;
	})
	.set(function(val){
		this.v = val;
	});


/**
 * SensorLog
 */
var SensorLogSchema = new Schema({
    /**
     * The GrowPlanInstance
     */
    gpi : { type : ObjectId, ref: 'GrowPlanInstance'},
    /**
     * timestamp
     */
	ts: { type: Date, required: true, default: Date.now },
    /**
     * logs
     */
    l : [SensorReadingSchema]
});

SensorLogSchema.virtual('logs')
	.get(function () {
	  return this.l;
	})
	.set(function(logs){
		this.l = logs;
	});

SensorLogSchema.index({ 'gpi ts': -1 }, { sparse: true });

exports.schema = SensorLogSchema;
exports.model = mongoose.model('SensorLog', SensorLogSchema);