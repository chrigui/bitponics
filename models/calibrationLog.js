/**
 * Logs for completed calibrations.
 */

 
var mongoose = require('mongoose'),
  mongooseTypes = require('mongoose-types'),
  Schema = mongoose.Schema,
  mongoosePlugins = require('../lib/mongoose-plugins'),
  useTimestamps = mongoosePlugins.useTimestamps,
  ObjectIdSchema = Schema.ObjectId,
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils'),
  mongooseConnection = require('../config/mongoose-connection').defaultConnection;


var CalibrationLogSchema = new Schema({
  d : { type : String, ref : 'Device', required : true },
  ts : { type : Date, default: Date.now, required : true},
  t : { 
    type : String, 
    enum : [
      feBeUtils.CALIB_LOG_TYPES.PH, 
      feBeUtils.CALIB_LOG_TYPES.EC
    ],
    required : true
  }
},
{ id : false}
);

CalibrationLogSchema.virtual('device')
  .get(function () {
    return this.d;
  })
  .set(function (device){
    this.d = device;
  });

CalibrationLogSchema.virtual('timestamp')
  .get(function () {
    return this.ts;
  })
  .set(function (timestamp){
    this.ts = timestamp;
  });

CalibrationLogSchema.virtual('type')
  .get(function () {
    return this.t;
  })
  .set(function (type){
    this.t = type;
  });

CalibrationLogSchema.plugin(mongoosePlugins.recoverableRemove);

  /*************** SERIALIZATION *************************/

/**
 * Remove the db-only-optimized property names and expose only the friendly names
 *
 * "Transforms are applied to the document and each of its sub-documents"
 * http://mongoosejs.com/docs/api.html#document_Document-toObject
 */
CalibrationLogSchema.set('toObject', {
  getters : true,
  transform : function(doc, ret, options){
    delete ret.d;
    delete ret.ts;
    delete ret.t;
  }
});
CalibrationLogSchema.set('toJSON', {
  getters : true,
  transform : CalibrationLogSchema.options.toObject.transform
});
/*************** END SERIALIZATION *************************/


CalibrationLogSchema.index({ 'd': 1, 'ts': -1 });

exports.schema = CalibrationLogSchema;
exports.model = mongooseConnection.model('CalibrationLog', CalibrationLogSchema);