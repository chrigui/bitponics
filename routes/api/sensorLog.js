var SensorLogModel = require('../../models/sensorLog').model,
    winston = require('winston'),
    routeUtils = require('../route-utils');

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List sensors
  app.get('/api/sensor-logs', 
  	routeUtils.middleware.ensureLoggedIn,
  	function (req, res, next){
	    return SensorLogModel.find(function (err, logs) {
	      if (err) { return next(err); }
	      return res.send(logs);
	    });
	  }
  );
};
