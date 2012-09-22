var GrowPlanInstanceModel = require('../models/growPlanInstance').model,
GrowPlanModel = require('../models/growPlan').model,
SensorModel = require('../models/sensor').model,
PhaseModel = require('../models/phase').model,
Action = require('../models/action'),
ActionModel = Action.model,
ActionUtils = Action.utils,
IdealRangeModel = require('../models/idealRange').model,
winston = require('winston'),
async = require('async'); 

module.exports = function(app){
	app.get('/dashboard', function (req, res, next) {
		if( !(req.user && req.user.id)){
			return res.redirect('/login');
		}

		var sensors,
		growPlanInstances,
		currentGrowPlanInstance,
		activePhase,
		activeIdealRanges,
		activeActions;

		async.waterfall(
			[
				function wf1(callback){
					// In parallel, get the GPIs and all Sensors
					async.parallel(
						[
							function parallel1(innerCallback){
								SensorModel.find().exec(innerCallback);
							},
							function parallel2(innerCallback){
								GrowPlanInstanceModel
								.find({ 'users': req.user })
								.populate('growPlan')
								.populate('device')
								.sort('-startDate')
								.exec(innerCallback);
							}
						],
	          // When those parallel ops are done, create the sensorLog entry and also retrieve 
	          // the active GrowPlanInstance
	          function parallelFinal(err, results){
	          	if (err) { return next(err);}

	          	sensors = results[0];
	          	growPlanInstances = results[1];

	          	//set first GP default to show in dashboard, will match on id if present below
	          	currentGrowPlanInstance = growPlanInstances[0];

			      	// Now, get the active phase & populate the active phase's Actions & IdealRanges
			      	var activeGrowPlanInstancePhase = currentGrowPlanInstance.phases.filter(function(item){ return item.active === true; })[0];

							PhaseModel
							.findById(activeGrowPlanInstancePhase.phase)		
							.populate('actions')
							.populate('idealRanges')
							.exec(callback);
						}
					);
				},
				function wf2(phaseResult, callback){
					activePhase = phaseResult;
					activeIdealRanges = activePhase.idealRanges;
					activeActions = activePhase.actions;
					callback();
				}
			],
			function wfFinal(err, result){
				if (err) { return next(err); }

				// Now get the models ready for client-side
				var locals = {
					activeGrowPlanInstances : growPlanInstances,
					currentGrowPlanInstance: currentGrowPlanInstance,
					sensors: {}	
				};

				sensors.forEach(function(sensor){
					locals.sensors[sensor.code] = {
						name: sensor.name,
						abbrev: sensor.abbrev || sensor.name,
						unit: sensor.unit,
						code : sensor.code,
						idealRange : null,
						logs : []
					};
				});

				activeIdealRanges.forEach(function(idealRange){
					var ir = {
						valueRange : idealRange.valueRange
					};
					if (idealRange.applicableTimeSpan){
						// TODO : parse. And use this to determine whether
						// the sensor is in range. 
					}
					locals.sensors[idealRange.sCode].idealRange = ir;
				});

				// Sort the sensor logs in descending timestamp order. 
				// TODO : Figure out if this is necessary. There's an index
				// on sensorLogs.timestamp so maybe it's already in some sort 
				// of order
				var sortedSensorLogs = currentGrowPlanInstance.sensorLogs.sort(function(logA, logB){
					return ( (logA.timestamp > logB) ? -1 : 1);
				});

				sortedSensorLogs.forEach(function(sensorsLog){
					sensorsLog.logs.forEach(function(log){
						locals.sensors[log.sCode].logs.push({
							timestamp : sensorsLog.timestamp,
							value : log.value
						});
					});
				});
				Object.keys(locals.sensors).forEach(function(key){
					if (locals.sensors[key].logs.length === 0){
						delete locals.sensors[key];
					}
				});

				locals.title = 'Bitponics - Dashboard';
				locals.user = req.user;
				locals.activeGrowPlanInstances = growPlanInstances;
				locals.currentGrowPlanInstance = currentGrowPlanInstance

				res.render('dashboard', locals);
			}
		);
	});
};

