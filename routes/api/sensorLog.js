var SensorLogModel = require('../../models/sensorLog').model,
    winston = require('winston');

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List sensors
  app.get('/api/sensor_logs', function (req, res, next){
    return SensorLogModel.find(function (err, logs) {
      if (err) { return next(err); }
      return res.send(logs);
    });
  });
};