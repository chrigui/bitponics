var ControlModel = require('../models/control').model,
GrowPlanModel = require('../models/growPlan').growPlan.model,
GrowPlanInstanceModel = require('../models/growPlanInstance').model,
SensorModel = require('../models/sensor').model,
SensorLogModel = require('../models/sensorLog').model,
ControlModel = require('../models/control').model,
Action = require('../models/action'),
ActionModel = Action.model,
ModelUtils = require('../models/utils'),
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
			var locals = {
				userGrowPlanInstances : [],
				communityGrowPlanInstances : []
			};

			GrowPlanInstanceModel
			.find({ 'users': req.user })
			.populate('device')
			.sort('-startDate')
			.exec(function(err, growPlanInstanceResults){
				if (err) { return next(err); }
				locals.userGrowPlanInstances = growPlanInstanceResults.map(function(gpi) { return gpi.toObject(); })
				res.render('gardens', locals);
			});
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
			var locals = {
				title : 'Bitponics - Dashboard',
				user : req.user,
				growPlanInstance : undefined,
				growPlan : undefined,
				sensors : undefined,
				controls : undefined,
				sensorDisplayOrder : ['ph','water','air','full','ec','tds','sal','hum','lux','ir','vis'],
				className: "app-page dashboard",
				pageType: "app-page"
			};

			async.parallel(
				[
					function getSensors(innerCallback){
						SensorModel.find({visible : true}).exec(innerCallback);
					},
					function getControls(innerCallback){
						ControlModel.find().exec(innerCallback);
					},
					function getGPI(innerCallback){
						GrowPlanInstanceModel
						.findById(req.params.growPlanInstanceId)
						.populate('device')
						.exec(function(err, growPlanInstanceResult){
							ModelUtils.getFullyPopulatedGrowPlan({_id: growPlanInstanceResult.growPlan}, function(err, growPlanResult){
								if (err) { return innerCallback(err); }
								growPlanInstanceResult = growPlanInstanceResult.toObject();
								growPlanInstanceResult.growPlan = growPlanResult[0];
								return innerCallback(null, growPlanInstanceResult);
							});
						});
					},
					function getSensorLogs(innerCallback){
						// get last day's sensor logs 
						SensorLogModel
						.find({gpi : req.params.growPlanInstanceId})
						.where('ts').gte(Date.now() - (24 * 60 * 60 * 1000))
						.exec(innerCallback);
					}
				],
				function(err, results){
						if (err) { return next(err); }
						locals.sensors = results[0];
						locals.controls = results[1];
						locals.growPlanInstance = results[2];
						//locals.growPlanInstance.growPlan = results[3][0];
						locals.latestSensorLogs = results[3] || [];

						res.render('gardens/dashboard', locals);
				}
			);

			
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