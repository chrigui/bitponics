var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	ObjectIdSchema = Schema.ObjectId,
  mongooseConnection = require('../config/mongoose-connection').defaultConnection;


var TagReadingSchema = new Schema({
    /**
     * Value.
     */
      v: { type : String, required: true},
      t: { type : [String]}
},
  /**
   * Prevent the _id property since these will only ever be subdocs in HarvestLog, don't need
   * ObjectIds created on them
   */
  { _id : false, id : false } );

TagReadingSchema.virtual('val')
  .get(function(){
    return this.v;
  })
  .set(function(val){
    this.v = val;
  });
TagReadingSchema.virtual('tags')
  .get(function(){
    return this.t;
  })
  .set(function(tags){
    this.t = tags;
  });


/**
 * TagLog
 */
var TagLogSchema = new Schema({
	/**
	 * The GrowPlanInstance
	 */
	gpi : { type: ObjectIdSchema, ref: 'GrowPlanInstance', required: true },

	/**
	 * timestamp
	 */
	ts: { type: Date, required: true, default: Date.now },

	l : [TagReadingSchema]
},
{ id : false });


TagLogSchema.virtual('logs')
  .get(function(){
    return this.l;
  })
  .set(function(logs){
    this.l = logs;
  });

TagLogSchema.virtual('timestamp')
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
TagLogSchema.set('toObject', {
  getters : true,
  transform : function(doc, ret, options){
    if (doc.schema === TagReadingSchema){
      delete ret.v;
      delete ret.t;
    } else {
      // else we're operating on the parent doc (the TagLog doc)
      delete ret.l;
      delete ret.ts;
    }
  }
});
TagLogSchema.set('toJSON', {
  getters : true,
  transform : TagLogSchema.options.toObject.transform
});
/*************** END SERIALIZATION *************************/


TagLogSchema.index({ 'gpi ts l.t': -1 });

exports.schema = TagLogSchema;
exports.model = mongooseConnection.model('TagLog', TagLogSchema);