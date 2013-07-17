var ActionModel = require('../models/action').model,
ControlModel = require('../models/control').model,
Device = require('../models/device'),
DeviceModel = require('../models/device').model,
DeviceUtils = Device.utils,
GrowPlanInstanceModel = require('../models/growPlanInstance').model,
GrowPlanModel = require('../models/growPlan').growPlan.model,
GrowSystemModel = require('../models/growSystem').model,
IdealRangesModel = require('../models/growPlan/idealRange').model,
LightBulbModel = require('../models/lightBulb').model,
LightFixtureModel = require('../models/lightFixture').model,
LightModel = require('../models/light').model,
ModelUtils = require('../models/utils'),
NotificationModel = require('../models/notification').model,
NutrientModel = require('../models/nutrient').model,
PhotoModel = require('../models/photo').model,
PlantModel = require('../models/plant').model,
SensorLogModel = require('../models/sensorLog').model,
SensorModel = require('../models/sensor').model,
UserModel = require('../models/user').model,
allPurposeGrowPlanId = '506de30c8eebf7524342cb70'
async = require('async'),
requirejs = require('../lib/requirejs-wrapper'),
feBeUtils = requirejs('fe-be-utils'),
moment = require('moment'),
passport = require('passport'),
routeUtils = require('./route-utils'),
winston = require('winston');

module.exports = function(app){
	
	// TODO : the /grow-plans page should actually display all the public grow plans in the
	// database. Using this redirect for now just because /grow-plans is the old /setup/grow-plan route
	// app.get('/grow-plans', function (req, res){
	// res.redirect('/setup/grow-plan');
	// });

	/**
	 * List all public growPlanInstances
	 */
	app.get('/grow-plans', 
		routeUtils.middleware.ensureSecure,
		routeUtils.middleware.ensureLoggedIn,
		function (req, res, next) {
			var locals = {
				userGrowPlans : [],
				communityGrowPlans : [],
				className: "grow-plans gardens app-page single-page",
    			pageType: "app-page"
			};
			async.parallel(
				[
					function getUserGrowPlans(innerCallback){
						GrowPlanModel
							.find({ createdBy: req.user })
							.sort('-updatedAt')
							.exec(innerCallback);
					},
					function getCommunityGrowPlans(innerCallback){
						GrowPlanModel
							.find({ visibility: 'public' })
							.sort('-updatedAt')
							.exec(innerCallback);
					}
				],
				function(err, results){
					if (err) { return next(err); }

					locals.userGrowPlans = results[0];
					locals.communityGrowPlans = results[1];

					res.render('grow-plans', locals);

				}
			);
		}
	);

	app.get('/grow-plans/:id',
		routeUtils.middleware.ensureSecure,
		routeUtils.middleware.ensureLoggedIn,
		function (req, res, next) {
			var locals = {
				title : 'Bitponics - Grow Plan',
				user : req.user,
				growPlan : undefined,
				className: "grow-plans growplans garden app-page dashboard",
        		pageType: 'app-page',
				//message : req.flash('info') //TODO: this isn't coming thru
				growSystems: {},
				plants: {},
				controls: {},
				idealRanges: [],
				actions: {},
				sensors: {}
			};


			async.parallel(
				[
					function parallel1(callback){
						//get all grow systems
						GrowSystemModel.find({}, callback);
					},
					function parallel2(callback){
						//get all plants
						PlantModel.find({}, '_id name', callback);
					},
					function parallel3(callback){
						//get all controls
						ControlModel.find({}, callback);
					},
					function parallel4(callback){
						//get all grow plans and populate
						async.series(
							[
								function (innerCallback) {									
									// First, verify that the user can see this
									GrowPlanModel.findById(req.params.id)
										.exec(function(err, growPlan){
											if (err) { return next(err); }
											if (!growPlan){ return next(new Error('Invalid grow plan id'));}
											if (!routeUtils.checkResourceReadAccess(growPlan, req.user)){
							          			return res.send(401, "This garden is private. You must be the owner to view it.");
							          		}
							          		if (!routeUtils.checkResourceModifyAccess(growPlan, req.user)){
							          			return res.send(401, "This garden is private. You must be the owner to modify it.");
							          		}

							          		locals.growPlan = growPlan;
							          		innerCallback();
							        	});


								},
								function (innerCallback) {
									var actionIds = [];
									// locals.growPlans.forEach(function(growPlan) {
										locals.growPlan.phases.forEach(function(phase) {
											phase.idealRanges.forEach(function(idealRange, i) {
												actionIds.push(idealRange.actionAboveMax);
												actionIds.push(idealRange.actionBelowMin);
											});
										});
									// });
									ActionModel.find({})
										.where('_id').in(actionIds)
										.exec(function (err, actions) {
											if (err) { return innerCallback(err); }
											actions.forEach(function(item, index) {
												locals.actions[item._id] = item;
											});
											innerCallback();
										});
								}
							],
							function (err, result) {
								callback();
							}
						);
					},
					function parallel5(callback){
						// Get the devices that the user owns
						DeviceModel.find({owner : req.user._id}, callback);
					},
					function parallel6(callback){
						// Get all sensors
						SensorModel.find({}, callback);
					},
					function parallel7(callback){
						// Get all lights
						LightModel.find({}, callback);
					},
					function parallel8(callback){
						// Get all lights
						LightFixtureModel.find({}, callback);
					},
					function parallel9(callback){
						// Get all lights
						LightBulbModel.find({}, callback);
					},
					function parallel10(callback){
						// Get all lights
						NutrientModel.find({}, callback);
					}
				],
				function parallelFinal(err, result){
					if (err) { return next(err); }
					var growSystems = result[0],
						plants = result[1],
						controls = result[2],
						userOwnedDevices = result[4],
						sensors = result[5],
						lights = result[6],
						lightFixtures = result[7],
						lightBulbs = result[8],
						nutrients = result[9];
          
					locals.growSystems = growSystems;
					locals.plants = plants;
					locals.userOwnedDevices = userOwnedDevices;
					locals.lights = lights;
					locals.lightFixtures = lightFixtures;
					locals.lightBulbs = lightBulbs;
					locals.nutrients = nutrients;
          
					//convert controls into obj with id as keys
					controls.forEach(function (item, index) {
						locals.controls[item._id] = item;
					});
          
					//convert sensors into obj with id as keys
					sensors.forEach(function (item, index) {
						locals.sensors[item.code] = item;
					});

	          		res.render('grow-plans/details', locals);
			      	
				}
			);
      	});

	
	
	// /**
	//  * Show a "dashboard" view of a growPlanInstance
	//  * TODO : Hide/show elements in the dashboard.jade depending on
	//  * whether the req.user is the owner/permissioned member or not
	//  */
	// app.get('/gardens/:growPlanInstanceId',
	// 	routeUtils.middleware.ensureSecure,
	// 	routeUtils.middleware.ensureLoggedIn,
	// 	function (req, res, next) {
	// 		var locals = {
	// 			title : 'Bitponics - Dashboard',
	// 			user : req.user,
	// 			growPlanInstance : undefined,
	// 			sensors : undefined,
	// 			controls : undefined,
	// 			sensorDisplayOrder : ['lux','hum','air','ph','ec','water','tds','sal','full','vis','ir'],
	// 			className: "app-page dashboard",
	// 			pageType: "app-page"
	// 		};

	// 		// First, verify that the user can see this
	// 		GrowPlanInstanceModel.findById(req.params.growPlanInstanceId)
	// 		.select('owner users visibility')
	// 		.exec(function(err, growPlanInstanceResultToVerify){
	// 			if (err) { return next(err); }
	// 			if (!growPlanInstanceResultToVerify){ return next(new Error('Invalid grow plan instance id'));}

	// 			if (!routeUtils.checkResourceReadAccess(growPlanInstanceResultToVerify, req.user)){
 //          return res.send(401, "This garden is private. You must be the owner to view it.");
 //      	}

 //      	locals.userCanModify = routeUtils.checkResourceModifyAccess(growPlanInstanceResultToVerify, req.user);

	// 			async.parallel(
	// 			[
	// 				function getSensors(innerCallback){
	// 					SensorModel.find({visible : true}).exec(innerCallback);
	// 				},
	// 				function getControls(innerCallback){
	// 					ControlModel.find()
	// 					.populate('onAction')
	// 					.populate('offAction')
	// 					.exec(innerCallback);
	// 				},
	// 				function getGpi(innerCallback){
	// 					GrowPlanInstanceModel
	// 					.findById(req.params.growPlanInstanceId)
	// 					.exec(function(err, growPlanInstanceResult){
	// 						if (err) { return innerCallback(err); }

	// 						growPlanInstanceResult = growPlanInstanceResult.toObject();

	// 						async.parallel(
	// 						[
	// 							function getDevice(innerInnerCallback){
	// 								if (!growPlanInstanceResult.device){
	// 									return innerInnerCallback();
	// 								}

	// 								DeviceModel.findById(growPlanInstanceResult.device)
	// 								.populate('status.actions')
	// 								.populate('status.activeActions')
	// 								.exec(function(err, deviceResult){
	// 									if (err) { return innerInnerCallback(err); }
	// 									growPlanInstanceResult.device = deviceResult.toObject();
	// 									return innerInnerCallback();
	// 								})
	// 							},
	// 							function getGrowPlan(innerInnerCallback){
	// 								ModelUtils.getFullyPopulatedGrowPlan({ _id: growPlanInstanceResult.growPlan }, function(err, growPlanResult){
	// 									if (err) { return innerCallback(err); }
										
	// 									growPlanInstanceResult.growPlan = growPlanResult[0];
	// 									return innerInnerCallback();
	// 								});		
	// 							}
	// 						],
	// 						function gpiParallelFinal(err){
	// 							return innerCallback(err, growPlanInstanceResult);
	// 						});
	// 					});
	// 				},
	// 				function getNotifications(innerCallback){
	// 					NotificationModel.find({
	// 	          gpi : req.params.growPlanInstanceId,
	// 	          tts : { $ne : null }
	// 	        })
	// 	        .sort({ 'tts' : -1 })
	// 	        .limit(10)
	// 	        .exec(function(err, notificationResults){
	// 	        	if (err) { return innerCallback(err); }
	// 	        	var notificationsWithSummaries = [];
	// 	        	async.each(notificationResults, 
	// 	        		function notificationIterator(notification, iteratorCallback){
	// 		        		var notificationObject = notification.toObject();
	// 		        		notification.getDisplay(
	// 		        			{ 
	// 		        				secureAppUrl : app.config.secureAppUrl,
	// 		        				displayType : 'summary'
	// 		        			},
	// 		        			function (err, notificationDisplay){
	// 		        				notificationObject.displays = {
	// 				        			summary : notificationDisplay
	// 				        		};
	// 				        		notificationsWithSummaries.push(notificationObject);
	// 		        				return iteratorCallback();
	// 		        			}
	// 	        			);
	// 	        		},
	// 	        		function notificationLoopEnd(err){
	// 	        			innerCallback(err, notificationsWithSummaries);
	// 	        		}
	//         		);
	// 	        });
	// 	      },
	// 	      function getPhotos(innerCallback){
	// 	      	PhotoModel.find({
	// 	      		gpi : req.params.growPlanInstanceId,
	// 	      	})
	// 	      	.limit(15)
	// 	      	.exec(innerCallback);
	// 	      }
	// 			],
	// 			function(err, results){
	// 				if (err) { return next(err); }

	// 				var sortedSensors = [];
	// 				results[0].forEach(function(sensor){
	// 					sortedSensors[locals.sensorDisplayOrder.indexOf(sensor.code)] = sensor;
	// 				});
	// 				sortedSensors = sortedSensors.filter(function(sensor){ return sensor;});

	// 				locals.sensors = sortedSensors;
	// 				locals.controls = results[1];
	// 				locals.growPlanInstance = results[2];
	// 				locals.notifications = results[3] || [];
	// 				locals.photos = results[4] || [];

	// 				res.render('gardens/dashboard', locals);
	// 			});
	// 		});
	// 	}
	// );



	// app.get('/gardens/:growPlanInstanceId/details',
	// 	routeUtils.middleware.ensureSecure,
	// 	routeUtils.middleware.ensureLoggedIn,
	// 	function (req, res, next) {
	// 		var locals = {
	// 			title : 'Bitponics - Dashboard',
	// 			user : req.user,
	// 			garden : undefined,
	// 			className: "app-page garden-details",
	// 			pageType: "app-page"
	// 		};

	// 		// First, verify that the user can see this
	// 		GrowPlanInstanceModel.findById(req.params.growPlanInstanceId)
	// 		.exec(function(err, growPlanInstanceResult){
	// 			if (err) { return next(err); }
	// 			if (!growPlanInstanceResult){ return next(new Error('Invalid grow plan instance id'));}

	// 			if (!routeUtils.checkResourceReadAccess(growPlanInstanceResult, req.user)){
 //          return res.send(401, "This garden is private. You must be the owner to view it.");
 //      	}

 //      	locals.userCanModify = routeUtils.checkResourceModifyAccess(growPlanInstanceResult, req.user);

 //      	locals.garden = growPlanInstanceResult.toObject();

	// 			res.render('gardens/details', locals);
	// 		});
	// 	}
	// );


	// /**
	//  * 
	//  */
	// app.get('/gardens/:growPlanInstanceId/sensor-logs', 
	// 	routeUtils.middleware.ensureSecure,
	// 	routeUtils.middleware.ensureLoggedIn,
	// 	function (req, res, next) {
	// 		var locals = {
	//     	title: "Bitponics | ",
	//     	className: "garden-sensor-logs"
	//     };
		  
	// 	  GrowPlanInstanceModel
	// 		.findById(req.params.growPlanInstanceId)
	// 		.populate('growPlan')
	// 		.exec(function(err, growPlanInstanceResult){
	// 			if (!routeUtils.checkResourceReadAccess(growPlanInstanceResult, req.user)){
 //          return res.send(401, "This garden is private. You must be the owner to view it.");
 //      	}

 //      	locals.growPlanInstance = growPlanInstanceResult;


 //      	async.parallel(
	// 				[
	// 					function parallel1(innerCallback){
	// 						SensorModel.find({visible : true}).exec(innerCallback);
	// 					},
	// 					function parallel2(innerCallback){
	// 						ControlModel.find().exec(innerCallback);
	// 					},
	// 					function parallel3(innerCallback){
	// 						SensorLogModel
	// 						.find({ gpi : req.params.growPlanInstanceId})
	// 						.select('ts l')
	// 						.exec(innerCallback);
	// 					}
	// 				],
	// 				function(err, results){
	// 					if (err) { return next(err); }
	// 					locals.sensors = results[0];
	// 					locals.controls = results[1];
	// 					locals.sensorLogs = results[2];

	// 					res.render('gardens/sensor-logs', locals);
	// 				}
	// 	    );
	// 		});
	// 	}
	// );
};