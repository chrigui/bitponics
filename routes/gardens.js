var ControlModel = require('../models/control').model,
GrowPlanModel = require('../models/growPlan').growPlan.model,
GrowPlanInstanceModel = require('../models/growPlanInstance').model,
SensorModel = require('../models/sensor').model,
SensorLogModel = require('../models/sensorLog').model,
Action = require('../models/action'),
ActionModel = Action.model,
routeUtils = require('./route-utils'),
winston = require('winston'),
async = require('async'); 

module.exports = function(app){
	
	/**
	 * List all public growPlanInstances
	 */
	app.get('/gardens', 
		routeUtils.middleware.ensureSecure,
		routeUtils.middleware.ensureLoggedIn,
		function (req, res, next) {
			// TODO. Show all public gardens
			res.send("Coming soon...");
		}
	);

	
	
	/**
	 * Show a "dashboard" view of a growPlanInstance
	 * Hide/show elements in the dashboard.jade depending on
	 * whether the req.user is the owner or not
	 */
	app.get('/gardens/:growPlanInstanceId', 
		routeUtils.middleware.ensureSecure,
		routeUtils.middleware.ensureLoggedIn,
		function (req, res, next) {
			// TODO
			res.send("Coming soon...");
		}
	);

	/**
	 *
	 */
	app.get('/gardens/:growPlanInstanceId/sensor-logs', 
		routeUtils.middleware.ensureSecure,
		routeUtils.middleware.ensureLoggedIn,
		function (req, res, next) {
			var locals = {
	    	title: "Bitponics | ",
	    	className: "garden-sensor-logs"
	    };
		  
	    async.parallel(
				[
					function parallel1(innerCallback){
						SensorModel.find({visible : true}).exec(innerCallback);
					},
					function parallel2(innerCallback){
						ControlModel.find().exec(innerCallback);
					},
					function parallel3(innerCallback){
						GrowPlanInstanceModel
						.findById(req.params.growPlanInstanceId)
						.populate('growPlan')
						.exec(innerCallback);
					},
					function parallel4(innerCallback){
						SensorLogModel
						.find({ gpi : req.params.growPlanInstanceId})
						.select('ts l')
						.exec(innerCallback);
					}
				],
				function(err, results){
					if (err) { return next(err); }
					locals.sensors = results[0];
					locals.controls = results[1];
					locals.growPlanInstance = results[2];
					locals.sensorLogs = results[3];

					res.render('gardens/sensor-logs', locals);
				}
	    );

		  
		}
	);
};