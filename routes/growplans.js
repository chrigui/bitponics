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
	winston = require('winston'),
	passport = require('passport'),
	async = require('async');

module.exports = function(app){
	
	app.all('/growplans', function (req, res, next) {
		if( !(req.user && req.user.id)){
			return res.redirect('/login?redirect=/growplans');
		}
		next();
	});

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
		// locals.growPlanDefault.estimatedDuration = 0;
		
		async.parallel(
			[
				function parallel1(callback){
					//get all grow systems
					GrowSystemModel.find({}, callback);
				},
				function parallel2(callback){
					//get all plants
					PlantModel.find({}, callback);
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
										if (err) { next(err); }
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
					)
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
					if(item.name === 'All-Purpose'){
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

		/*
		 // sample req.body:
		 {
		    "system.name": "Bitponics Water Culture System",
		    "plants": ["Cauliflowers", "Cauliflowers"],
		    "growplans": "506de30c8eebf7524342cb70",
		    "parentGrowPlan": "506de30c8eebf7524342cb70",
		    "gpedit_name": "All-Purpose",
		    "gpedit_description": "A generic grow plan suitable for running a garden with a wide variety of plants. It won't get you optimum yields for everything, but it's a good starting point while you learn about the specific needs of your plants.",
		    "phase_slider_current": "0",
		    "phase_slider_0": "7",
		    "gpedit_Seedling_growsystem": "506de3008eebf7524342cb40",
		    "gpedit_Seedling_growmedium": ["rockwool", ""],
		    "gpedit_Seedling_actions": ["506de3128eebf7524342cb87", "506de2f18eebf7524342cb27"],
		    "gpedit_Seedling_idealranges": ["506de30c8eebf7524342cb71", "506de30d8eebf7524342cb76", "506de30b8eebf7524342cb6e"],
		    "gpedit_Seedling_enddescription": ["This phase is over once the seedlings start growing their first true leaves.", ""],
		    "gpedit_Seedling_nutrients": "",
		    "phase_slider_1": "35",
		    "gpedit_Vegetative_growsystem": "506de30d8eebf7524342cb77",
		    "gpedit_Vegetative_growmedium": ["hydroton", ""],
		    "gpedit_Vegetative_nutrients": ["506de3038eebf7524342cb4b", "506de3038eebf7524342cb4c", "506de3038eebf7524342cb4d", ""],
		    "gpedit_Vegetative_actions": ["506de2ec8eebf7524342cb24", "506de2ef8eebf7524342cb25", "506de2f08eebf7524342cb26", "506de2f18eebf7524342cb27"],
		    "gpedit_Vegetative_idealranges": ["506de30b8eebf7524342cb6d", "506de30b8eebf7524342cb6f"],
		    "gpedit_Vegetative_enddescription": ["", ""],
		    "phase_slider_2": "182",
		    "gpedit_Blooming_growmedium": "",
		    "gpedit_Blooming_nutrients": "",
		    "gpedit_Blooming_enddescription": "",
		    "phase_slider_3": "182",
		    "gpedit_Fruiting_growmedium": "",
		    "gpedit_Fruiting_nutrients": "",
		    "gpedit_Fruiting_enddescription": ""
		}
		*/

		// regex to match on ObjectId: /[0-9a-f]{24}/
		// Steps:
		// 1. get the grow plan by id
		// 2. check whether the form contains any edits to the grow plan. 
		//      if yes, branch the GP (create new with parentGrowPlan set to the old one)
		//      if no, cool.
		// 3. Create a new GPI, set owner to the user and activate it
		// 

		GrowPlanModel.findById(req.body.parentGrowPlan)
		.populate('controls')
		.populate('sensors')
		.populate('plants')
		.populate('phases.nutrients')
		.populate('phases.actions')
		.populate('phases.growSystem')
		.populate('phases.phaseEndActions')
		.exec(function(err, growPlanResult){
			if (err) { 
				result.status = 'error';
				result.errors = [err.message];
				return res.json(result);
			}

			var submittedGrowPlan = new GrowPlanModel({
				parentGrowPlanId: undefined,
				createdBy: req.user,
				name: req.body.gpedit_name,
				description: req.body.gpedit_description,
				plants: req.body.plants,
				sensors: [],
				controls: [],
				phases: [],
				visibility: undefined
			}),
			isNewGrowPlan = false;

			// compare the submitted data to the growPlan
			isNewGrowPlan = !growPlanResult.isEquivalentTo(submittedGrowPlan);

			async.series([
				function branchingCheck(callback){
					if (!isNewGrowPlan){ return callback(null, growPlanResult); }

					// branch the growPlanResult
					submittedGrowPlan.parentGrowPlanId = growPlanResult._id;
					submittedGrowPlan.save(function (err){
						return callback(err, submittedGrowPlan);
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
					startingPhaseData = growPlanToUse.getPhaseAndDayFromStartDay(parseInt(req.phase_slider_current, 10));
				
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