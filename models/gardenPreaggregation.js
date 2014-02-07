/**
 * @module models/GardenPreaggregation
 * 
 * Modeled on Appboy's pre-aggregation as presented in 
 * http://www.slideshare.net/mongodb/mongo-db-analytics-meetup-at-ebay-11-192013key
 * http://www.quora.com/Time-Series/What-is-the-best-way-to-store-time-series-data-in-MongoDB
 */

var mongoose = require('mongoose'),
    mongoosePlugins = require('../lib/mongoose-plugins'),
    Schema = mongoose.Schema,
    ObjectIdSchema = Schema.ObjectId,
    GardenPreaggregationModel,
    mongooseConnection = require('../config/mongoose-connection').defaultConnection;


/**
 * GardenPreaggregation
 */
var GardenPreaggregationSchema = new Schema({
  
  g : { type: ObjectIdSchema, ref: 'GrowPlanInstance', required : true },
  
  /**
   * Should be a zeroed-out day (new Date(2014,2,6))
   * Everything in UTC, of course
   */
  date : { type : Date, required: true },
  
  totals : {
    deviceLogCount : Number,
    sensors : { type : Schema.Types.Mixed }
  },
  /* Now, it's organized by hour, 0-23
   * Have to use Mixed type since the keys will be dynamic
   * Using sums for sensor values so that we can use a simple $inc operator
   * when doing updates. Application is responsible for sum/count to get the avg for the time period
   *
   * http://mongoosejs.com/docs/api.html#model_Model.update
   * GardenPreaggregation.update({ g: garden._id, date : date}, {$inc: { "totals.sensors.sensorCode1.sum" : sensorValue, "totals.sensors.sensorCode1.count" : 1}, ... }}, {upsert: true}, function(err{...});
   * "0.totals.sensors.sensorCode1.sum", "0.fives.00.sensors.sensorCode1.sum"
   * Each hour has an object of the following format:

    {
      "totals" : {
        "deviceLogCount" : Number,
        "sensors" : {
          "sensorCode1" : {
            "sum" : Number,
            "count" : Number
          },
          "sensorCode2" : ... 
        }
      },
      "fives" : {
        "0" : {
          "deviceLogCount" : Number,
          "sensors" : {
            "sensorCode1" : {
              "sum" : Number,
              "count" : Number
            },
            "sensorCode2" : ... 
          }
        },
        "5",
        "10",
        "15",
        ...  
      }
    }
  */
  
  0 : { type : Schema.Types.Mixed },
  1 : { type : Schema.Types.Mixed },
  2 : { type : Schema.Types.Mixed },
  3 : { type : Schema.Types.Mixed },
  4 : { type : Schema.Types.Mixed },
  5 : { type : Schema.Types.Mixed },
  6 : { type : Schema.Types.Mixed },
  7 : { type : Schema.Types.Mixed },
  8 : { type : Schema.Types.Mixed },
  9 : { type : Schema.Types.Mixed },
  10 : { type : Schema.Types.Mixed },
  11 : { type : Schema.Types.Mixed },
  12 : { type : Schema.Types.Mixed },
  13 : { type : Schema.Types.Mixed },
  14 : { type : Schema.Types.Mixed },
  15 : { type : Schema.Types.Mixed },
  16 : { type : Schema.Types.Mixed },
  17 : { type : Schema.Types.Mixed },
  18 : { type : Schema.Types.Mixed },
  19 : { type : Schema.Types.Mixed },
  20 : { type : Schema.Types.Mixed },
  21 : { type : Schema.Types.Mixed },
  22 : { type : Schema.Types.Mixed },
  23 : { type : Schema.Types.Mixed }
},
/**
 * Prevent the _id property since these will only ever be subdocs in SensorLog, don't need 
 * ObjectIds created on them
 */
{id : false } );

GardenPreaggregationSchema.plugin(mongoosePlugins.useTimestamps);
GardenPreaggregationSchema.plugin(mongoosePlugins.recoverableRemove);

GardenPreaggregationSchema.index({ 'g' : 1,  'date': -1 });


/**
 * @type {Schema}
 */
exports.schema = GardenPreaggregationSchema;



/**
 * @constructor
 * @alias module:models/GardenPreaggregation.GardenPreaggregationModel
 * @type {Model}
 */
exports.model = mongooseConnection.model('GardenPreaggregation', GardenPreaggregationSchema);