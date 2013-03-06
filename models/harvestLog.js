var mongoose = require('mongoose'),
    mongooseTypes = require('mongoose-types'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var HarvestReadingSchema = new Schema({

    /**
     * Plant
     */
    p: { type : ObjectId, ref: 'Plant', required: true},

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
    gpi : { type: ObjectId, ref: 'GrowPlanInstance', required: true },

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

HarvestLogSchema.virtual('logs')
    .get(function () {
        return this.l;
    })
    .set(function(logs){
        this.l = logs;
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
    }
  }
});
HarvestLogSchema.set('toJSON', {
  getters : true,
  transform : HarvestLogSchema.options.toObject.transform
});
/*************** END SERIALIZATION *************************/


HarvestLogSchema.index({ 'gpi ts plant': -1 });

exports.schema = HarvestLogSchema;
exports.model = mongoose.model('HarvestLog', HarvestLogSchema);