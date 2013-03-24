var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	ObjectIdSchema = Schema.ObjectId,
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
    gpi : { type : ObjectIdSchema, ref: 'GrowPlanInstance'},
    
    /**
     * timestamp
     */
	  ts: { type: Date, required: true, default: Date.now },
    /**
     * logs
     */
    l : [SensorReadingSchema]
},
{ id : false });

SensorLogSchema.virtual('logs')
	.get(function () {
	  return this.l;
	})
	.set(function(logs){
		this.l = logs;
	});

SensorLogSchema.virtual('timestamp')
  .get(function () {
    return this.ts;
  })
  .set(function(timestamp){
    this.ts = timestamp;
  });

/*************** SERIALIZATION *************************/

/**
 * Remove the db-only-optimized property names and expose only the friendly names
 *
 * "Transforms are applied to the document and each of its sub-documents"
 * http://mongoosejs.com/docs/api.html#document_Document-toObject
 */
SensorLogSchema.set('toObject', {
  getters : true,
  transform : function(doc, ret, options){
    if (doc.schema === SensorReadingSchema){
      delete ret.s;
      delete ret.v;
    } else {
      // else we're operating on the parent doc (the SensorLog doc)
      delete ret.l;
      delete ret.ts;
    }
  }
});
SensorLogSchema.set('toJSON', {
  getters : true,
  transform : SensorLogSchema.options.toObject.transform
});
/*************** END SERIALIZATION *************************/


SensorLogSchema.index({ 'gpi ts': -1 }, { sparse: true });

exports.schema = SensorLogSchema;
exports.model = mongoose.model('SensorLog', SensorLogSchema);