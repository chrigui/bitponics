var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  mongoosePlugins = require('../lib/mongoose-plugins'),
	Schema = mongoose.Schema,
	ObjectIdSchema = Schema.ObjectId,
  mongooseConnection = require('../config/mongoose-connection').defaultConnection;


var TextReadingSchema = new Schema({
      /**
       * Raw text
       */
      v: { type : String, required: true},
      /*
       * Tags
       */
      t: { type : [String]}
},
  /**
   * Prevent the _id property since these will only ever be subdocs in HarvestLog, don't need
   * ObjectIds created on them
   */
  { _id : false, id : false } );

TextReadingSchema.virtual('val')
  .get(function(){
    return this.v;
  })
  .set(function(val){
    this.v = val;
  });
TextReadingSchema.virtual('tags')
  .get(function(){
    return this.t;
  })
  .set(function(tags){
    this.t = tags;
  });


/**
 * TextLog
 */
var TextLogSchema = new Schema({
	/**
	 * The GrowPlanInstance
	 */
	gpi : { type: ObjectIdSchema, ref: 'GrowPlanInstance', required: true },

	/**
	 * timestamp
	 */
	ts: { type: Date, required: true, default: Date.now },

	l : [TextReadingSchema]
},
{ id : false });

TextLogSchema.plugin(mongoosePlugins.recoverableRemove);

TextLogSchema.virtual('logs')
  .get(function(){
    return this.l;
  })
  .set(function(logs){
    this.l = logs;
  });

TextLogSchema.virtual('timestamp')
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
TextLogSchema.set('toObject', {
  getters : true,
  transform : function(doc, ret, options){
    if (doc.schema === TextReadingSchema){
      delete ret.v;
      delete ret.t;
    } else {
      // else we're operating on the parent doc (the TextLog doc)
      delete ret.l;
      delete ret.ts;
    }
  }
});
TextLogSchema.set('toJSON', {
  getters : true,
  transform : TextLogSchema.options.toObject.transform
});
/*************** END SERIALIZATION *************************/


TextLogSchema.index({ 'gpi ts l.t': -1 });

exports.schema = TextLogSchema;
exports.model = mongooseConnection.model('TextLog', TextLogSchema);
