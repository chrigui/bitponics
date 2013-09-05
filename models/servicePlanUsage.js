/**
 * Logs of usage of service plans, by growPlanInstance.
 * Meant to have entries created daily by a worker process that scans all
 * active gpi's 
 */

var mongoose = require('mongoose'),
  mongooseTypes = require('mongoose-types'),
  Schema = mongoose.Schema,
  ObjectIdSchema = Schema.ObjectId,
  mongoosePlugins = require('../lib/mongoose-plugins'),
  useTimestamps = mongoosePlugins.useTimestamps,
  winston = require('winston'),
  mongooseConnection = require('../config/mongoose-connection').defaultConnection,
  ServicePlanUsageModel,
  ServicePlanUsageSchema;


var ServicePlanUsageSchema = new Schema(
  {
    owner : { type : ObjectIdSchema, ref: "User" },

    gpi: { type: ObjectIdSchema, ref: "GrowPlanInstance" },

    ts: { type: Date, default: Date.now },

    servicePlanType : { type : ObjectIdSchema, ref: "ServicePlanType" },

    paid : { type : Boolean }
  },
  { id : false }
);

ServicePlanUsageSchema.plugin(useTimestamps);


ServicePlanUsageSchema.index({ 'gpi' : 1, 'paid': 1 });

exports.schema = ServicePlanUsageSchema;
exports.model = ServicePlanUsageModel = mongooseConnection.model('ServicePlanUsage', ServicePlanUsageSchema);