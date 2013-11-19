/**
 * All "deleted" docs get sent here, for later recovery if necessary.
 */

 var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	Schema = mongoose.Schema,
	ObjectIdSchema = Schema.ObjectId,
  ObjectId = mongoose.Types.ObjectId,
	async = require('async'),
  ModelUtils = require('./utils'),
	getObjectId = ModelUtils.getObjectId,
  mongooseConnection = require('../config/mongoose-connection').defaultConnection;
  

var removedDocumentModel,
	
removedDocumentSchema = new Schema({

	/**
   * Name of the mongo collection the document came from
   */
  collectionName: { type: String },
	

  /**
   * ObjectId of removed document. Stored separately to allow querying.
   */
  documentId : { type : ObjectIdSchema },


  /**
   * JSON dump of document
   */
  documentObject : Schema.Types.Mixed,


  /**
   * User who removed document
   */
  removedBy : { type : ObjectIdSchema, ref: 'User' }
},
{ id : false });

removedDocumentSchema.plugin(useTimestamps);


removedDocumentSchema.index({ documentId: 1  });

removedDocumentModel = mongooseConnection.model('removedDocument', removedDocumentSchema);
exports.schema = removedDocumentSchema;
exports.model = removedDocumentModel;


