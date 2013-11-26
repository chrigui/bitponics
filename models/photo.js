var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	ObjectIdSchema = Schema.ObjectId,
  ObjectId = mongoose.Types.ObjectId,
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils'),
  mongoosePlugins = require('../lib/mongoose-plugins'),
  mongooseConnection = require('../config/mongoose-connection').defaultConnection,
  async = require('async'),
  gm = require('gm').subClass({ imageMagick: true }),
  tmpDirectory = require('path').join(__dirname, '/../tmp/'),
  PhotoModel;


/**
 * Photo
 */
var PhotoSchema = new Schema({
	
  /**
	 * The GrowPlanInstance. Optional. A denormalized convenience property to
   * make querying for a garden's photos easier.
   * 
   */
	gpi : { type: ObjectIdSchema, ref: 'GrowPlanInstance', required: false},

  
  /**
   * TODO: concept of ref'ed docs should be generalized rather than just having 'gpi'
   *
  referencedDocuments : [
    {
      collectionName : { type : String },
      documentId : { type : String }
    }
  ],
  */

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
   * User-definable name
   */
  name : { type : String },


  /**
   * Number of bytes of the original photo
   */
  size : { type : Number },

  
  /**
   * Number of bytes of the thumbnail (150x150 max)
   */
  thumbnailSize : { type : Number }
},
{ id : false });

PhotoSchema.plugin(mongoosePlugins.useTimestamps);
PhotoSchema.plugin(mongoosePlugins.visibility);
PhotoSchema.plugin(mongoosePlugins.recoverableRemove);


PhotoSchema.index({ 'gpi' : 1, 'date': -1 }, { sparse : true });
//PhotoSchema.index({ 'referencedDocuments.documentId' : 1, 'date': -1 }, { sparse : true });



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
 * @param options.gpi
 * @param {Stream} options.stream : optional. If set, this is used to stream to S3
 * @param {string} options.streamPath: optional. Must be set if options.stream is not set. Path on the file system to stream to S3.
 * @param {bool=} options.preserveStreamPath : optional. If true, file at options.streamPath is left alone after upload. If omitted or false, file is deleted after uplaod.
 */
PhotoSchema.static("createAndStorePhoto",  function(options, callback){
  if (options.contentType.indexOf("image") !== 0){
    return callback(new Error("Invalid photo content type " + options.contentType));
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
      gpi : options.gpi,
      visibility : (options.visibility || feBeUtils.VISIBILITY_OPTIONS.PUBLIC)
    });
    

    async.parallel(
      [
        function uploadOriginal(innerCallback){
          var knoxMethod = ( (typeof options.stream !== 'undefined') ? 'putStream' : 'putFile'),
            knoxMethodArgument = (knoxMethod === 'putStream' ? options.stream : options.streamPath),
            knoxHeaders = {
              'Content-Type': photo.type, 
              'x-amz-acl': 'private'
            };

          if (options.size){
            knoxHeaders["Content-Length"] = options.size;
          }

          knoxClient[knoxMethod](
            knoxMethodArgument,
            s3Config.photoPathPrefix + photo._id.toString(), 
            knoxHeaders, 
            function(err, result) {
              winston.info("RETURNED FROM S3, err:", err, ", statusCode: ", result.statusCode);

              if (err) { return innerCallback(err);  }
            
              if (result.statusCode !== 200) {
                return innerCallback(new Error("Status " + (result.statusCode || 'undefined') + " from S3"));
              }

              return innerCallback();
            }
          );
        },
        function createAndUploadThumbnail(innerCallback){

          var intermediateGM,
              thumbnailGM;

          var filesizeCallback = function(err, value){
            if (err) { return innerCallback(err);  }

            // value is returned in format "724B", need to parse int to get byte number
            photo.thumbnailSize = parseInt(value, 10);
            
            knoxClient.putStream(
              thumbnailGM.stream(),
              s3Config.photoPathPrefix + photo._id.toString() + '/' + feBeUtils.PHOTO_THUMBNAIL_SIZE.WIDTH, 
              {
                'Content-Type': photo.type, 
                'x-amz-acl': 'private',
                'Content-Length' : photo.thumbnailSize
              }, 
              function(err, result) {
                if (err) { return innerCallback(err);  }
              
                if (result.statusCode !== 200) {
                  return innerCallback(new Error("Status " + (result.statusCode || 'undefined') + " from S3"));
                }

                return innerCallback();
              }
            );
          };

          // Constructor is lenient in parsing stream vs path vs buffer. 2nd arg is optional and is only used for filetype inference, so it should handle undefined fine
          // https://github.com/aheckmann/gm#constructor
          if (typeof options.stream !== 'undefined'){
            intermediateGM = gm(options.stream, options.originalFileName)
          } else {
            intermediateGM = gm(options.streamPath)
          }
          
          // Resize to create thumbnail, but don't scale up smaller images
          // http://stackoverflow.com/questions/14705152/thumbnails-from-graphics-magick-without-upscaling
          intermediateGM
          .resize(feBeUtils.PHOTO_THUMBNAIL_SIZE.WIDTH, feBeUtils.PHOTO_THUMBNAIL_SIZE.HEIGHT, ">")
          .gravity('Center')
          // use a white background rather than transparent. If we're dealing with a jpg, transparent gets rendered as black. No thanks mister.
          .background('#fff')
          .extent(feBeUtils.PHOTO_THUMBNAIL_SIZE.WIDTH, feBeUtils.PHOTO_THUMBNAIL_SIZE.HEIGHT);
          
          // Finalize the processing so that we can get the proper filesize
          thumbnailGM = gm(intermediateGM.stream(), options.originalFileName);
          
          thumbnailGM.filesize({bufferStream : true}, filesizeCallback);
        }
      ],
      function(err, results){
         if (typeof options.streamPath !== 'undefined' && !options.preserveStreamPath){
          // Delete the file from disk
          fs.unlink(options.streamPath);
        }

        if (err) { return callback(err);}

        return photo.save(callback);
      }
    );
  }
);

/*************** END STATIC METHODS *************************/





exports.schema = PhotoSchema;
exports.model = PhotoModel = mongooseConnection.model('Photo', PhotoSchema);