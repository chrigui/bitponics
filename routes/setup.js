var mongoose = require('mongoose'),
  Device = require('../models/device'),
  DeviceModel = Device.model,
  DeviceUtils = Device.utils,
  ModelUtils = require('../models/utils'),
  GrowPlanInstanceModel = require('../models/growPlanInstance').model,
  GrowPlanModel = require('../models/growPlan').growPlan.model,
  UserModel = require('../models/user').model,
  DeviceModel = require('../models/device').model,
  PlantModel = require('../models/plant').model,
  ControlModel = require('../models/control').model,
  SensorModel = require('../models/sensor').model,
  IdealRangesModel = require('../models/growPlan/idealRange').model,
  GrowSystemModel = require('../models/growSystem').model,
  ActionModel = require('../models/action').model,
  LightModel = require('../models/light').model,
  LightFixtureModel = require('../models/lightFixture').model,
  LightBulbModel = require('../models/lightBulb').model,
  NutrientModel = require('../models/nutrient').model,
  ModelUtils = require('../models/utils'),
  routeUtils = require('./route-utils'),
	winston = require('winston'),
	passport = require('passport'),
	async = require('async'),
	allPurposeGrowPlanId = '506de30c8eebf7524342cb70'
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils');

module.exports = function(app){
  app.get('/setup',
    routeUtils.middleware.ensureSecure,
    routeUtils.middleware.ensureLoggedIn,
    function (req, res, next){
      req.user.ensureAvailableDeviceKey(null, function(err, availableDeviceKey){
        if (err) { return next(err); }

        var locals = {
          title: 'Bitponics Device Setup',
          className : 'landing-page single-page app-page setup',
          pageType: "app-page",
          nextUrl: req.headers.host + '/setup/device',
          availableDeviceKey : availableDeviceKey
        };

        res.render('setup', locals);
      });
    }
  );


  /*
   * Send serial key entered by user
   *
   **/
  app.post('/setup',
    routeUtils.middleware.ensureSecure,
    routeUtils.middleware.ensureLoggedIn,
    function (req, res, next){
      winston.info('post to /setup');
      winston.info('req.body');
      winston.info(req.body);
      
      var serial = req.body.serial;

      if (!serial){
        return res.json(400, { success : false, error : 'Request requires serial parameter'});
      }

      req.user.ensureAvailableDeviceKey(serial, function(err, availableDeviceKey){
        if (err) { return next(err); }

        return res.json(200, availableDeviceKey);
      });
    }
  )

  app.get('/setup/device',
    function (req, res, next){
        var locals = {
          title: 'Bitponics Device Setup',
          className : 'landing-page single-page app-page setup',
          pageType: "app-page"
        };
        res.render('setup/device', locals);
    }
  );
  /**
   * Posts to /setup should specify a device MAC address, and should
   * be an authenenticated user. We then assign the device to the user
   * 
   * Required params : "deviceMacAddress", "publicDeviceKey"
   */
  app.post('/setup/device',
    // routeUtils.middleware.ensureSecure,
    // routeUtils.middleware.ensureLoggedIn,
    function (req, res, next){
      var rawDeviceMacAddress = req.body('deviceMacAddress'),
        cleanDeviceMacAddress,
        device,
        now = Date.now();

      winston.info('/setup/device');
      winston.info('req.params');
      winston.info(req.params);
      winston.info('req.body');
      winston.info(req.body);
      winston.info('req.user');
      winston.info(req.user);

      if (!rawDeviceMacAddress){
        return res.json(400, { success : false, error : 'Request requires deviceMacAddress parameter'});
      }
      if (!req.param('publicDeviceKey')) { return res.json(400, { success : false, error : 'Request requires publicDeviceKey parameter'});}

      cleanDeviceMacAddress = rawDeviceMacAddress.replace(/:/g,'')

      ModelUtils.assignDeviceToUser({
        deviceMacAddress : cleanDeviceMacAddress,
        publicDeviceKey : req.param('publicDeviceKey'),
        user : req.user
      }, function(err, result){
        if (err){ return next(err); }
        return res.json(200, {success: true});
      });
    }
  );

  app.get('/setup/device/*',
    function (req, res, next){
      return res.redirect('/setup/device/');
    }
  );



	app.get('/setup/grow-plan', 
		routeUtils.middleware.ensureSecure,
		routeUtils.middleware.ensureLoggedIn,
		function (req, res, next){
			var locals = {
				title : 'Grow Plans',
				className : 'app-page landing-page single-page growplans',
        pageType: 'app-page',
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
          
					//single out the default grow plan
					locals.growPlans.forEach(function (item, index) {
						if(item._id == allPurposeGrowPlanId){
							locals.growPlanDefault = item;
							locals.growPlans.splice(index, 1); //remove default from general list of grow plans
						}
					});

					res.render('setup/grow-plan', locals);
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
	app.post('/setup/grow-plan', 
		routeUtils.middleware.ensureSecure, 
		routeUtils.middleware.ensureLoggedIn,
		function (req, res, next) {
			var user = req.user,
				submittedGrowPlan = req.body.submittedGrowPlan,
        sourceGrowPlanId = req.body.submittedGrowPlan._id,
        result = {
					status : 'success',
					message : '',
					errors : []
				};

      winston.info("POST to /setup/grow-plan, req.body: ");
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
        visibility : feBeUtils.VISIBILITY_OPTIONS.PUBLIC,
        silentValidationFail : true
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
            device : req.body.deviceId
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


	app.get('/setup/grow-plan/filter', 
		function (req, res, next){
			return res.redirect('/setup/grow-plan/#!/filter');
		}
	);

	app.get('/setup/grow-plan/browse',
		function (req, res, next){
			return res.redirect('/setup/grow-plan/#!/browse');
		}
	);

	app.get('/setup/grow-plan/customize*',
		function (req, res, next){
			return res.redirect('/setup/grow-plan/');
		}
	);

	
};