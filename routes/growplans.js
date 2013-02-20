var GrowPlanInstanceModel = require('../models/growPlanInstance').model,
  GrowPlanModel = require('../models/growPlan').growPlan.model,
  UserModel = require('../models/user').model,
  DeviceModel = require('../models/device').model,
  PlantModel = require('../models/plant').model,
  ControlModel = require('../models/control').model,
  SensorModel = require('../models/sensor').model,
  IdealRangesModel = require('../models/growPlan/idealRange').model,
  GrowSystemModel = require('../models/growSystem').model,
  ActionModel = require('../models/action').model,
  ModelUtils = require('../models/utils'),
  routeUtils = require('./route-utils'),
	winston = require('winston'),
	passport = require('passport'),
	async = require('async'),
	allPurposeGrowPlanId = '506de30c8eebf7524342cb70';

module.exports = function(app){
	
	app.all('/growplans*', routeUtils.middleware.ensureLoggedIn);

	app.get('/growplans', function (req, res){
		var locals = {
			title : 'Grow Plans',
			className : 'growplans',
			//message : req.flash('info') //TODO: this isn't coming thru
			growSystems: {},
			plants: {},
			controls: {},
			growPlans: {},
			idealRanges: [],
			actions: {},
			sensors: {},
			growPlanDefault: {}
		}
		
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
								GrowPlanModel.find({ visibility: 'public' })
								.populate('controls')
								.populate('sensors')
								.populate('plants')
								.populate('phases.nutrients')
								.populate('phases.actions')
								.populate('phases.growSystem')
								.populate('phases.phaseEndActions')
								.exec(function(err, gps){
									if (err) { return innerCallback(err); }
									locals.growPlans = gps;
									innerCallback();
								});
							},
							function (innerCallback) {
								var actionIds = [];
								locals.growPlans.forEach(function(growPlan) {
									growPlan.phases.forEach(function(phase) {
										phase.idealRanges.forEach(function(idealRange, i) {
											actionIds.push(idealRange.actionAboveMax);
											actionIds.push(idealRange.actionBelowMin);
										});
									});
								});
								ActionModel.find({})
									.where('_id').in(actionIds)
									.exec(function (err, actions) {
										if (err) { return innerCallback(err); }
										actions.forEach(function(item, index) {
											locals.actions[item.id] = item;
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
				}
			],
			function parallelFinal(err, result){
				if (err) { return next(err); }
				var growSystems = result[0],
						plants = result[1],
						controls = result[2],
						userOwnedDevices = result[4],
						sensors = result[5];

				locals.growSystems = growSystems;
				locals.plants = plants;
				locals.userOwnedDevices = userOwnedDevices;

				//convert controls into obj with id as keys
				controls.forEach(function (item, index) {
					locals.controls[item.id] = item;
				});

				//convert sensors into obj with id as keys
				sensors.forEach(function (item, index) {
					locals.sensors[item.code] = item;
				});

				//single out the default grow plan
				locals.growPlans.forEach(function (item, index) {
					if(item._id == allPurposeGrowPlanId){
						locals.growPlanDefault = item;
						locals.growPlans.splice(index, 1); //remove default from general list of grow plans
					}
				});

				res.render('growplans', locals);
			}
		)
	});

	app.post('/growplans', function (req, res) {
		var user = req.user,
			growplans = req.body.growplan,
			result = {
				status : 'success',
				message : '',
				errors : []
			};


		// regex to match on ObjectId: /[0-9a-f]{24}/
		// Steps:
		// 1. get the grow plan by id
		// 2. check whether the form contains any edits to the grow plan. 
		//      if yes, branch the GP (create new with parentGrowPlan set to the old one)
		//      if no, cool.
		// 3. Create a new GPI, set owner to the user and activate it
		// 

		ModelUtils.getFullyPopulatedGrowPlan({_id:req.body.parentGrowPlan}, function(err, growPlans){
			if (err) { 
				result.status = 'error';
				result.errors = [err.message];
				return res.json(result);
			}

			var parentGrowPlan = growPlans[0],
				submittedGrowPlan = new GrowPlanModel({
					parentGrowPlanId: undefined,
					createdBy: req.user,
					name: req.body.gpedit_name,
					description: req.body.gpedit_description,
					plants: req.body.plants,
					sensors: [],
					controls: [],
					phases: [],
					visibility: 'public'
				});

			async.series([
				function branchingCheck(callback){
					GrowPlan.isEquivalentTo(parentGrowPlan, submittedGrowPlan, function(err, isEquivalent){
						if (err) { 
							return callback(err); 
						}
						if (isEquivalent) { 
							return callback(null, parentGrowPlan); 
						} else {
							// branch the parentGrowPlan
							submittedGrowPlan.parentGrowPlanId = parentGrowPlan._id;
							submittedGrowPlan.save(function (err){
								return callback(err, submittedGrowPlan);
							});		
						}
					});
				}
			],
			function (err, results){
				if (err) { 
					result.status = 'error';
					result.errors = [err.message];
					return res.json(result);
				}

				var growPlanToUse = results[0],
					startingPhaseData = growPlanToUse.getPhaseAndDayFromStartDay(parseInt(req.growPlan.currentGrowPlanDay, 10));
				
				GrowPlanInstanceModel.create({
					growPlan : growPlanToUse._id,
					owner : req.user._id,
					active : true,
					activePhaseId : startingPhaseData.phaseId,
					activePhaseDay : startingPhaseData.day,
					device : req.body.device
				},
				function(err, growPlanInstance){
					if (err) { 
						result.status = 'error';
						result.errors = [err.message];
					} else {
						result.status = 'success';
						result.message = 'Activated grow plan';
						winston.info('activated grow plan for user ' + req.user._id.toString() + ', gp id ' + growPlanResult._id.toString() + ', gpi id ' + growPlanInstance._id.toString());
					}
					return res.json(result);
				});			
			}	
			);			
		});
	});

}