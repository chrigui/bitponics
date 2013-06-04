var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	ObjectIdSchema = Schema.ObjectId,
  ObjectId = mongoose.Types.ObjectId,
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils'),
  mongoosePlugins = require('../lib/mongoose-plugins'),
  mongooseConnection = require('../config/mongoose-connection').defaultConnection,
  PhotoModel;


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


PhotoSchema.index({ 'gpi ts': -1 });



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






/*************** STATIC METHODS *************************/

/**
 *
 * @param options.owner
 * @param options.originalFileName
 * @param options.name
 * @param options.contentType
 * @param options.date
 * @param options.size
 * @param options.visibility
 * @param options.tags
 * @param {Stream} options.stream : optional. If set, this is used to stream to S3
 * @param {string} options.streamPath: optional. Must be set if options.stream is not set. Path on the file system to stream to S3.
 * @param {bool=} options.preserveStreamPath : optional. If true, file at options.streamPath is left alone after upload. If omitted or false, file is deleted after uplaod.
 */
PhotoSchema.static("createAndStorePhoto",  function(options, callback){
  if (options.contentType.indexOf("image") !== 0){
    return callback(new Error("Invalid photo conten type " + options.contentType));
  }

  var s3Config = require('../config/s3-config'),
      knox = require('knox'),
      knoxClient = knox.createClient(s3Config),
      fs = require('fs'),
      requirejs = require('../lib/requirejs-wrapper'),
      feBeUtils = requirejs('fe-be-utils');

  var now = new Date(),
    photo = new PhotoModel({
      owner : options.owner,
      originalFileName : options.originalFileName,
      name : options.name,
      type : options.contentType,
      date : options.date || now,
      size : options.size,
      tags : options.tags || [],
      visibility : (options.visibility || feBeUtils.VISIBILITY_OPTIONS.PUBLIC)
    }),
    knoxMethod = ( (typeof options.stream !== 'undefined') ? 'putStream' : 'putFile'),
    knoxMethodArgument = (knoxMethod === 'putStream' ? options.stream : options.streamPath),
    knoxHeaders = {
      'Content-Type': photo.type, 
      'x-amz-acl': 'private'
    };

    if (options.size){
      knoxHeaders["Content-Length"] = options.size;
    }

    console.log("DATE", options.date, photo.date);

    knoxClient[knoxMethod](
      knoxMethodArgument,
      s3Config.photoPathPrefix + photo._id.toString(), 
      knoxHeaders, 
      function(err, result) {
        if (err) { return callback(err);  }
      
        if (result.statusCode !== 200) {
          return callback(new Error("Status " + result.statusCode + " from S3"));
        }

        if (knoxMethod === 'putFile' && !options.preserveStreamPath){
          // Delete the file from disk
          fs.unlink(options.streamPath);
        }
        
        return photo.save(callback);
      }
    );
  }
);

/*************** END STATIC METHODS *************************/





exports.schema = PhotoSchema;
exports.model = PhotoModel = mongooseConnection.model('Photo', PhotoSchema);