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
	allPurposeGrowPlanId = '506de30c8eebf7524342cb70'
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils');

module.exports = function(app){
	
	app.get('/grow-plans', 
		routeUtils.middleware.ensureSecure,
		routeUtils.middleware.ensureLoggedIn,
		function (req, res){
			var locals = {
				title : 'Grow Plans',
				className : 'app-page landing-page single-page growplans',
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
						locals.controls[item._id] = item;
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
		}
	);


  /**
   * Create and activate a GrowPlanInstance based on the provided GrowPlan, 
   * branching a new GrowPlan if necessary
   * 
   * Request body properties:
   * 
   * @param {object} req.body.submittedGrowPlan
   * @param {number} req.body.growPlanInstance.currentGrowPlanDay 
   * @param {string=} req.body.deviceId : optional. Define if device should be activated with this GrowPlan instance
   */
	app.post('/grow-plans', 
		routeUtils.middleware.ensureSecure, 
		routeUtils.middleware.ensureLoggedIn,
		function (req, res) {
			var user = req.user,
				submittedGrowPlan = req.body.submittedGrowPlan,
        sourceGrowPlanId = req.body.submittedGrowPlan._id,
        result = {
					status : 'success',
					message : '',
					errors : []
				};

      winston.info("POST to /grow-plans, req.body: ");
      winston.info(JSON.stringify(req.body));

			// regex to match on ObjectId: /[0-9a-f]{24}/
			
      // Steps:
			// 1. get the grow plan by id
			// 2. check whether the submitted grow plan contains any edits to the grow plan. 
			//      if yes, branch the GP (create new with parentGrowPlan set to the old one)
      //        also, for any nested objects that have been modified, create new
			//      if no edits, carry on.
			// 3. Create a new GPI, set owner to the user and activate it
			// 
			GrowPlanModel.createNewIfUserDefinedPropertiesModified(
      {
        growPlan : submittedGrowPlan,
        user : user,
        visibility : feBeUtils.VISIBILITY_OPTIONS.PUBLIC
      }, 
      function(err, validatedGrowPlan){
        if (err) { 
          result.status = 'error';
          result.errors = [err.message];
          return res.json(result);
        }

        var startingPhaseData = validatedGrowPlan.getPhaseAndDayFromStartDay(parseInt(req.body.growPlanInstance.currentGrowPlanDay, 10));
        
        GrowPlanInstanceModel.create(
          {
            growPlan : validatedGrowPlan._id,
            owner : user,
            active : true,
            activePhaseId : startingPhaseData.phaseId,
            activePhaseDay : startingPhaseData.day,
            device : req.body.device
          },
          function(err, createdGrowPlanInstance){
            if (err) { 
              result.status = 'error';
              result.errors = [err.message];
            } else {
              result.status = 'success';
              result.message = 'Activated grow plan';
              winston.info(
                'activated grow plan for user ' + user._id.toString() + 
                ', gp id ' + validatedGrowPlan._id.toString() + 
                ', gpi id ' + createdGrowPlanInstance._id.toString()
              );
            }
            return res.json(result);
          }
        );      
      });
		}
	); // /app.post('/grow-plans'


};