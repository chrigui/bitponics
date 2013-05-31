var ControlModel = require('../models/control').model,
GrowPlanModel = require('../models/growPlan').growPlan.model,
GrowPlanInstanceModel = require('../models/growPlanInstance').model,
SensorModel = require('../models/sensor').model,
SensorLogModel = require('../models/sensorLog').model,
ControlModel = require('../models/control').model,
Action = require('../models/action'),
ActionModel = Action.model,
DeviceModel = require('../models/device').model,
NotificationModel = require('../models/notification').model,
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
				sensors : undefined,
				controls : undefined,
				sensorDisplayOrder : ['ph','air','lux','water','ec','tds','sal','hum','full','vis','ir'],
				className: "app-page dashboard",
				pageType: "app-page"
			};

			// First, verify that the user can see this
			GrowPlanInstanceModel.findById(req.params.growPlanInstanceId)
			.select('owner users visibility')
			.exec(function(err, growPlanInstanceResultToVerify){
				if (err) { return next(err); }
				if (!growPlanInstanceResultToVerify){ return next(new Error('Invalid grow plan instance id'));}

				if (!routeUtils.checkResourceReadAccess(growPlanInstanceResultToVerify, req.user)){
          return res.send(401, "This garden is private. You must be the owner to view it.");
      	}

				async.parallel(
				[
					function getSensors(innerCallback){
						SensorModel.find({visible : true}).exec(innerCallback);
					},
					function getControls(innerCallback){
						ControlModel.find()
						.populate('onAction')
						.populate('offAction')
						.exec(innerCallback);
					},
					function getGpi(innerCallback){
						GrowPlanInstanceModel
						.findById(req.params.growPlanInstanceId)
						//.populate('device')
						.exec(function(err, growPlanInstanceResult){
							if (err) { return innerCallback(err); }

							growPlanInstanceResult = growPlanInstanceResult.toObject();

							async.parallel(
							[
								function getDevice(innerInnerCallback){
									if (!growPlanInstanceResult.device){
										return innerInnerCallback();
									}

									DeviceModel.findById(growPlanInstanceResult.device)
									.populate('status.actions')
									.populate('status.activeActions')
									.exec(function(err, deviceResult){
										if (err) { return innerInnerCallback(err); }
										growPlanInstanceResult.device = deviceResult.toObject();
										return innerInnerCallback();
									})
								},
								function getGrowPlan(innerInnerCallback){
									ModelUtils.getFullyPopulatedGrowPlan({ _id: growPlanInstanceResult.growPlan }, function(err, growPlanResult){
										if (err) { return innerCallback(err); }
										
										growPlanInstanceResult.growPlan = growPlanResult[0];
										return innerInnerCallback();
									});		
								}
							],
							function gpiParallelFinal(err){
								return innerCallback(err, growPlanInstanceResult);
							});
						});
					},
					function getSensorLogs(innerCallback){
						// get last day's sensor logs 
						SensorLogModel
						.find({gpi : req.params.growPlanInstanceId})
						.where('ts').gte(Date.now() - (24 * 60 * 60 * 1000))
						.exec(innerCallback);
					},
					function getNotifications(innerCallback){
						NotificationModel.find({
		          gpi : req.params.growPlanInstanceId,
		          tts : { $ne : null }
		        })
		        .exec(innerCallback);
		      }
				],
				function(err, results){
					if (err) { return next(err); }

					var sortedSensors = [];
					results[0].forEach(function(sensor){
						sortedSensors[locals.sensorDisplayOrder.indexOf(sensor.code)] = sensor;
					});
					sortedSensors = sortedSensors.filter(function(sensor){ return sensor;});

					locals.sensors = sortedSensors;
					locals.controls = results[1];
					locals.growPlanInstance = results[2];
					locals.latestSensorLogs = results[3] || [];
					locals.notifications = results[4] || [];

					if (locals.growPlanInstance.device){
						if (locals.growPlanInstance.device.status.activeActions){
							locals.growPlanInstance.device.status.activeActions.forEach(function(activeAction){
								activeAction.control = locals.controls.filter(function(control){
									return control._id.equals(activeAction.control);
								})[0];
							});
						}
					}

					res.render('gardens/dashboard', locals);
				});
			});
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