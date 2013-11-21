var mongoose = require('mongoose'),
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils');

module.exports = {
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
   * Overriding Mongoose's "remove" function. 
   * We want removed docs to get sent to the "removedDocument" collection in addition
   * to being removed from the original collection.
   * 
   * @param options.query {Object} Mongoose query
   * @param options.user= {ObjectID|User} User who's requesting the removal. Optional
   * @param callback. Function called with (err, growPlanInstance)
   */
  recoverableRemove : function(schema, options){
    options = options || {};
    var Query = mongoose.Query,
        RemovedDocumentModel = require('../models/removedDocument').model,
        utils = require('../models/utils'),
        getObjectId = utils.getObjectId;

    schema.static('remove', function(options, callback) {
      var DocumentModel = this,
          userId = options.user ? getObjectId(options.user) : undefined;

      DocumentModel.find(options.query).exec(function(err, results){
        var removedDocuments = results.map(function(result){
          return {
            collectionName : DocumentModel.collection,
            documentId : result._id,
            documentObject : result.toJSON(),
            removedBy : userId
          }
        });
        RemovedDocumentModel.create(removedDocuments, function(err){

          // Copying code from Mongoose Model.remove
          // http://mongoosejs.com/docs/api.html#model_Model.remove
          
          // get the mongodb collection object
          var mq = new Query(options.query, {}, DocumentModel, DocumentModel.collection);

          return mq.remove(callback);

        });
      });
    });
  }
};