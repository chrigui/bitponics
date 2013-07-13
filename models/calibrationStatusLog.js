/**
 * Logs for calibration statuses as posted by device.
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


var CalibrationStatusLogSchema = new Schema({
  d : { type : String, ref : 'Device', required : true },
  ts : { type : Date, default: Date.now, required : true},
  m : { 
    type : String, 
    enum : [
      feBeUtils.CALIB_MODES.PH_4, 
      feBeUtils.CALIB_MODES.PH_7,
      feBeUtils.CALIB_MODES.PH_10,
      feBeUtils.CALIB_MODES.EC_DRY,
      feBeUtils.CALIB_MODES.EC_LO,
      feBeUtils.CALIB_MODES.EC_HI
    ],
    required : true
  },
  s : {
    type : String, 
    enum : [
      feBeUtils.CALIB_STATUSES.SUCCESS, 
      feBeUtils.CALIB_STATUSES.ERROR
    ],
    default : feBeUtils.CALIB_STATUSES.SUCCESS,
    required : true
  },
  msg : { type : String }
},
{ id : false}
);


CalibrationStatusLogSchema.virtual('device')
  .get(function () {
    return this.d;
  })
  .set(function (device){
    this.d = device;
  });

CalibrationStatusLogSchema.virtual('timestamp')
  .get(function () {
    return this.ts;
  })
  .set(function (timestamp){
    this.ts = timestamp;
  });

CalibrationStatusLogSchema.virtual('mode')
  .get(function () {
    return this.m;
  })
  .set(function (mode){
    this.m = mode;
  });

CalibrationStatusLogSchema.virtual('status')
  .get(function () {
    return this.s;
  })
  .set(function (status){
    this.s = status;
  });

CalibrationStatusLogSchema.virtual('message')
  .get(function () {
    return this.msg;
  })
  .set(function (message){
    this.msg = message;
  });


/*************** SERIALIZATION *************************/

/**
 * Remove the db-only-optimized property names and expose only the friendly names
 *
 * "Transforms are applied to the document and each of its sub-documents"
 * http://mongoosejs.com/docs/api.html#document_Document-toObject
 */
CalibrationStatusLogSchema.set('toObject', {
  getters : true,
  transform : function(doc, ret, options){
    delete ret.ts;
    delete ret.m;
    delete ret.s;
    delete ret.msg;
  }
});
CalibrationStatusLogSchema.set('toJSON', {
  getters : true,
  transform : CalibrationStatusLogSchema.options.toObject.transform
});
/*************** END SERIALIZATION *************************/


CalibrationStatusLogSchema.index({ 'd': 1, 'ts': -1 });

exports.schema = CalibrationStatusLogSchema;
exports.model = mongooseConnection.model('CalibrationStatusLog', CalibrationStatusLogSchema);
