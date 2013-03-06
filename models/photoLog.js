var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;



var PhotoReadingSchema = new Schema({
    /**
     * URL. Idea is to upload to S3 and store the resulting URL in mongo
     */
    u: { type : mongoose.SchemaTypes.Url, required: true},

    /**
     * Array of freeform tag strings
     */
    t: [String]
},
  /**
   * Prevent the _id property since these will only ever be subdocs in HarvestLog, don't need
   * ObjectIds created on them
   */
  { _id : false, id : false } );

PhotoReadingSchema.virtual('url')
  .get(function(){
    return this.u;
  })
  .set(function(url){
    this.u = url;
  });
PhotoReadingSchema.virtual('tags')
  .get(function(){
    return this.t;
  })
  .set(function(tags){
    this.t = tags;
  });



/**
 * PhotoLog
 */
var PhotoLogSchema = new Schema({
	/**
	 * The GrowPlanInstance
	 */
	gpi : { type: ObjectId, ref: 'GrowPlanInstance', required: true },

	/**
	 * timestamp
	 */
	ts: { type: Date, required: true, default: Date.now },

	l : [PhotoReadingSchema]
},
{ id : false });

PhotoLogSchema.virtual('logs')
  .get(function(){
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
PhotoLogSchema.set('toObject', {
  getters : true,
  transform : function(doc, ret, options){
    if (doc.schema === PhotoReadingSchema){
      delete ret.u;
      delete ret.t;
    } else {
      // else we're operating on the parent doc (the SensorLog doc)
      delete ret.l;
    }
  }
});
PhotoLogSchema.set('toJSON', {
  getters : true,
  transform : PhotoLogSchema.options.toObject.transform
});
/*************** END SERIALIZATION *************************/



PhotoLogSchema.index({ 'gpi ts logs.tags': -1 });

exports.schema = PhotoLogSchema;
exports.model = mongoose.model('PhotoLog', PhotoLogSchema);