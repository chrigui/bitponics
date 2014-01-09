/**
 * All "Removed" docs get sent here, for later recovery if necessary.
 * 
 * @module models/RemovedDocument
 */

 var mongoose = require('mongoose'),
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	Schema = mongoose.Schema,
	ObjectIdSchema = Schema.ObjectId,
  ObjectId = mongoose.Types.ObjectId,
	async = require('async'),
  ModelUtils = require('./utils'),
	getObjectId = ModelUtils.getObjectId,
  mongooseConnection = require('../config/mongoose-connection').defaultConnection;
  

var RemovedDocumentModel,
	
RemovedDocumentSchema = new Schema({

	/**
   * Name of the mongo collection the document came from
   */
  collectionName: { type: String },
	

  /**
   * ObjectId of Removed document. Stored separately to allow querying.
   */
  documentId : { type : String },


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

RemovedDocumentSchema.plugin(useTimestamps);


RemovedDocumentSchema.index({ collectionName:1, documentId: 1  });

RemovedDocumentModel = mongooseConnection.model('RemovedDocument', RemovedDocumentSchema);

/**
 * @type {Schema}
 */
exports.schema = RemovedDocumentSchema;

/**
 * @constructor
 * @alias module:models/RemovedDocument.RemovedDocumentModel
 * @type {Model}
 */
exports.model = RemovedDocumentModel;