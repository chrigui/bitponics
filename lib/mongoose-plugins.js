var mongoose = require('mongoose'),
  mongooseTypes = require('mongoose-types'),
  Schema = mongoose.Schema,
  ObjectIdSchema = Schema.ObjectId,
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils');

module.exports = {
  
  /**
   * Add 'createdAt' and 'updatedAt' timestamps
   */
  useTimestamps : function (schema, options) {
    schema.add({
        createdAt: Date
      , updatedAt: Date
    });
    schema.pre('save', function (next) {
      if (!this.createdAt) {
        this.createdAt = this.updatedAt = new Date;
      } else {
        this.updatedAt = new Date;
      }
      next();
    });
  },

  
  /**
   * Add a 'visibility' field limited to shared visibility options
   */
  visibility : function (schema, options){
    options = options || {};

    schema.add({
      visibility : { 
        type: String, 
        enum: [
          feBeUtils.VISIBILITY_OPTIONS.PUBLIC,
          feBeUtils.VISIBILITY_OPTIONS.PRIVATE
        ], 
        default : options.default || feBeUtils.VISIBILITY_OPTIONS.PUBLIC
      }
    });
  },



  /**
   * Add a 'visibility' field limited to shared visibility options
   */
  photos : function (schema, options){
    options = options || {};

    schema.add({
      photos : [{ type: ObjectIdSchema, ref: 'Photo'}]
    });
  },

  
  /**
   * Overriding Mongoose's "remove" function. 
   * Removed docs get stored in the "removedDocument" collection in addition
   * to being removed from the original collection.
   * 
   * @param options.callback= {function(err, removedDocumentResults, callback)} Optional extension point.
   */
  recoverableRemove : function(schema, options){
    options = options || {};

    var Query = mongoose.Query,
        RemovedDocumentModel = require('../models/removedDocument').model,
        utils = require('../models/utils'),
        getObjectId = utils.getObjectId;

    /**
     *
     * @param query {Object} Mongoose query
     * @param callback {function(err)} Function called after completion
     */
    schema.static('remove', function(query, callback) {
      var DocumentModel = this;
          //userId = options.user ? getObjectId(options.user) : undefined;

      DocumentModel.find(query).exec(function(err, results){
        var removedDocuments = results.map(function(result){
          return {
            collectionName : DocumentModel.collection.name,
            documentId : result._id,
            documentObject : result.toJSON()
          }
        });
        RemovedDocumentModel.create(removedDocuments, function(err){
          var removedDocumentResults = Array.prototype.slice.call(arguments, 1);
          // Copying code from Mongoose Model.remove
          // http://mongoosejs.com/docs/api.html#model_Model.remove
          
          // get the mongodb collection object
          var mq = new Query(query, {}, DocumentModel, DocumentModel.collection);

          return mq.remove(function(err){
            if (options.callback) { 
              return options.callback(err, removedDocumentResults, callback); 
            }
            return callback(err, removedDocumentResults);
          });
        });
      });
    });
  }
};