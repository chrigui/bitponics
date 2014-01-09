/**
 * @module models/Sensor
 */

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  mongoosePlugins = require('../lib/mongoose-plugins'),
  useTimestamps = mongoosePlugins.useTimestamps,
  ObjectIdSchema = Schema.ObjectId,
  mongooseConnection = require('../config/mongoose-connection').defaultConnection;

var SensorSchema = new Schema({
    name: { type: String, required: true },

    /**
     * abbrev is used in the UI
     */
    abbrev: {type: String },

    /**
     * Unit of measurement
     */
    unit: { type: String, required: true },

    /**
     * Unique code, used by the firmware as well as most of the server code
     */
    code: { type: String, required: true, unique: true },

    visible : { type : Boolean, default : true }
  },
  { id : false });

SensorSchema.plugin(useTimestamps);
SensorSchema.plugin(mongoosePlugins.recoverableRemove);

/**
 * @type {Schema}
 */
exports.schema = SensorSchema;

/**
 * @constructor
 * @alias module:models/Sensor.SensorModel
 * @type {Model}
 */
exports.model = mongooseConnection.model('Sensor', SensorSchema);