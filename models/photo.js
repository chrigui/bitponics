var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	ObjectIdSchema = Schema.ObjectId,
  ObjectId = mongoose.Types.ObjectId,
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils'),
  mongoosePlugins = require('../lib/mongoose-plugins'),
  mongooseConnection = require('../config/mongoose-connection').defaultConnection;


/**
 * Photo
 */
var PhotoSchema = new Schema({
	/**
	 * The GrowPlanInstance
	 */
	gpi : { type: ObjectIdSchema, ref: 'GrowPlanInstance', required: false},

  tags : [ String ],

  owner : { type: ObjectIdSchema, ref: 'User', required: true },

  originalFileName : { type : String },

  /**
   * User-assignable date
   */
  date : { type : Date, default : Date.now },


  /** 
   * The MIME-type of the file
   */
  type : { type : String },


  /**
   * user-define-able name
   */
  name : { type : String },


  /**
   * Number of bytes of the original photo
   */
  size : { type : Number }
},
{ id : false });

PhotoSchema.plugin(mongoosePlugins.useTimestamps);
PhotoSchema.plugin(mongoosePlugins.visibility);

/*************** SERIALIZATION *************************/


/**
 * Remove the db-only-optimized property names and expose only the friendly names
 *
 * "Transforms are applied to the document and each of its sub-documents"
 * http://mongoosejs.com/docs/api.html#document_Document-toObject
 */
PhotoSchema.set('toObject', {
  getters : true,
  transform : function(doc, ret, options){
  }
});
PhotoSchema.set('toJSON', {
  getters : true,
  transform : PhotoSchema.options.toObject.transform
});
/*************** END SERIALIZATION *************************/



PhotoSchema.index({ 'gpi ts': -1 });

exports.schema = PhotoSchema;
exports.model = mongooseConnection.model('Photo', PhotoSchema);