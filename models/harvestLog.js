var mongoose = require('mongoose'),
    mongoosePlugins = require('../lib/mongoose-plugins'),
    Schema = mongoose.Schema,
    ObjectIdSchema = Schema.ObjectId,
  	mongooseConnection = require('../config/mongoose-connection').defaultConnection;


var HarvestReadingSchema = new Schema({

    /**
     * Plant
     */
    p: { type : ObjectIdSchema, ref: 'Plant', required: true},

    /**
     * Value of HarvestLog is stored as weight in grams.
     * Localized at the view level depending on user settings
     */
    w: { type : Number, required: true}
},
/**
 * Prevent the _id property since these will only ever be subdocs in HarvestLog, don't need
 * ObjectIds created on them
 */
{ _id : false, id : false } );

HarvestReadingSchema.virtual('plant')
    .get(function(){
        return this.p;
    })
    .set(function(plant){
        this.p = plant;
    });
HarvestReadingSchema.virtual('weight')
    .get(function(){
        return this.w;
    })
     .set(function(weight){
        this.w = weight;
    });


/**
 * HarvestLog
 */
var HarvestLogSchema = new Schema({
    /**
     * The GrowPlanInstance
     */
    gpi : { type: ObjectIdSchema, ref: 'GrowPlanInstance', required: true },

    /**
     * timestamp
     */
    ts: { type: Date, required: true, default: Date.now },

    /**
     * logs
     */
    l : [HarvestReadingSchema]
},
{ id : false });

HarvestLogSchema.plugin(mongoosePlugins.recoverableRemove);

HarvestLogSchema.virtual('logs')
    .get(function () {
        return this.l;
    })
    .set(function(logs){
        this.l = logs;
    });

HarvestLogSchema.virtual('timestamp')
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
HarvestLogSchema.set('toObject', {
  getters : true,
  transform : function(doc, ret, options){
    if (doc.schema === HarvestReadingSchema){
      delete ret.p;
      delete ret.w;
    } else {
      // else we're operating on the parent doc (the SensorLog doc)
      delete ret.l;
      delete ret.ts;
    }
  }
});
HarvestLogSchema.set('toJSON', {
  getters : true,
  transform : HarvestLogSchema.options.toObject.transform
});
/*************** END SERIALIZATION *************************/


HarvestLogSchema.index({ 'gpi': 1, 'ts': -1 });

exports.schema = HarvestLogSchema;
exports.model = mongooseConnection.model('HarvestLog', HarvestLogSchema);