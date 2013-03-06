var mongoose = require('mongoose'),
  mongooseTypes = require('mongoose-types'),
  Schema = mongoose.Schema,
  mongoosePlugins = require('../lib/mongoose-plugins'),
  useTimestamps = mongoosePlugins.useTimestamps,
  ObjectId = Schema.ObjectId;

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

exports.schema = SensorSchema;
exports.model = mongoose.model('Sensor', SensorSchema);