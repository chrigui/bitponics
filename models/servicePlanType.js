var mongoose = require('mongoose'),
  mongooseTypes = require('mongoose-types'),
  Schema = mongoose.Schema,
  ObjectIdSchema = Schema.ObjectId,
  mongoosePlugins = require('../lib/mongoose-plugins'),
  useTimestamps = mongoosePlugins.useTimestamps,
  winston = require('winston'),
  mongooseConnection = require('../config/mongoose-connection').defaultConnection,
  ServicePlanTypeModel,
  ServicePlanTypeSchema;


ServicePlanTypeSchema = new Schema({

  name : { type : String, required : true },

  description: { type: String, required: true },

  prices : [
    {
      dollars : { type : Number, required : true },
      per : {
        duration : { type : Number, required : true },
        durationTyppe : { type : String, enum : ["months", "years"], required : true }
      }
    }
  ]
},
{ id : false });

ServicePlanTypeSchema.plugin(useTimestamps);

exports.schema = ServicePlanTypeSchema;
exports.model = ServicePlanTypeModel = mongooseConnection.model('ServicePlanType', ServicePlanTypeSchema);