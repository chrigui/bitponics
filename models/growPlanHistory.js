/**
 * A means of storing past revisions of individial Grow Plans. 
 * Not in active use anywhere in the UI.
 * @module models/GrowPlanHistory
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
  

var GrowPlanHistoryModel,
	
GrowPlanHistorySchema = new Schema({

	/**
   * The GrowPlan from which this GrowPlan was branched and customized
   */
  growPlanId: { type: ObjectIdSchema, ref: 'GrowPlan' },
	

  /**
   * JSON dump of fully-populated Grow Plan
   */
  growPlanObject : Schema.Types.Mixed


},
{ id : false });

GrowPlanHistorySchema.plugin(useTimestamps);
GrowPlanHistorySchema.plugin(mongoosePlugins.recoverableRemove);

GrowPlanHistoryModel = mongooseConnection.model('GrowPlanHistory', GrowPlanHistorySchema);

/**
 * @type {Schema}
 */
exports.schema = GrowPlanHistorySchema;

/**
 * @constructor
 * @alias module:models/GrowPlanHistory.GrowPlanHistoryModel
 * @type {Model}
 */
exports.model = GrowPlanHistoryModel;