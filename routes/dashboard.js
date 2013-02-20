var ControlModel = require('../models/control').model,
GrowPlanModel = require('../models/growPlan').growPlan.model,
GrowPlanInstanceModel = require('../models/growPlanInstance').model,
SensorModel = require('../models/sensor').model,
Action = require('../models/action'),
ActionModel = Action.model,
ActionUtils = Action.utils,
routeUtils = require('./route-utils'),
winston = require('winston'),
async = require('async'); 

module.exports = function(app){
	app.get('/dashboard', routeUtils.middleware.ensureLoggedIn, function (req, res, next) {
		var sensors,
		growPlanInstances,
		currentGrowPlanInstance,
		currentGrowPlan,
		phases,
		activePhase,
		activeIdealRanges,
		activeActions,
		activeControlActions = [],
		controls;

		async.waterfall(
			[
				function wf1(callback){
					// In parallel, get the GPIs and all Sensors
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
								.find({ 'users': req.user })
								.populate('device')
								.sort('-startDate')
								.exec(innerCallback);
							}
						],
						function parallelFinal(err, results){
	          	if (err) { return next(err);}

	          	sensors = results[0];
	          	controls = results[1];
	          	growPlanInstances = results[2];

	          	//set first GP default to show in dashboard, 
	          	// TODO : filter based on active or something will match on id if present below
	          	currentGrowPlanInstance = growPlanInstances[0];

	          	if (currentGrowPlanInstance) {
			      	GrowPlanModel
								.findById(currentGrowPlanInstance.growPlan)		
								.populate('phases.actions')
								.exec(callback);

							} else {
								//TODO: flash is now a separate lib as of express 3 so get connect-flash working
								req.flash("info", "It looks like you haven't set up any grow plans yet.");
								return res.redirect('/growplans?noactivegrowplans');
							}
						}	
					);
				},
				function wf2(growPlanResult, callback){
					if (!growPlanResult){ return callback(new Error('GrowPlanInstance.growPlan not found'));}
					currentGrowPlan = growPlanResult;
					// Now, get the active phase & populate the active phase's Actions & IdealRanges
			    var activeGrowPlanInstancePhase = currentGrowPlanInstance.phases.filter(function(item){ return item.active === true; })[0];

			    if (!activeGrowPlanInstancePhase) {
			    	return res.redirect('/growplans?noactivegrowplans');
			    }

					activePhase = currentGrowPlan.phases.filter(function(item){ return item._id.equals(activeGrowPlanInstancePhase.phase); })[0];
					activeIdealRanges = activePhase.idealRanges;
					activeActions = activePhase.actions;

					if (currentGrowPlanInstance.device){
						// get the actions that have a corresponding control in the associated device
						activeActions.forEach(function(activeAction){
							if (!activeAction.control){ return; }
							var controlMapEntry = currentGrowPlanInstance.device.controlMap.filter(
								function(controlMapEntry){
									return (controlMapEntry.control.equals(activeAction.control));
								});
							controlMapEntry = (controlMapEntry.length > 0 ? controlMapEntry[0] : undefined);
							if (controlMapEntry){
								activeControlActions.push(activeAction);
							}
						});
					}
					callback();
				}
			],
			function wfFinal(err, result){
				if (err) { return next(err); }

				// Now get the models ready for client-side
				var locals = {
					activeGrowPlanInstances : growPlanInstances,
					currentGrowPlanInstancePhases: currentGrowPlanInstance.phases.map(
						function(phase) { 
							result = phase.toObject();
							result.phase = currentGrowPlan.phases.filter(function(item){return item._id.equals(phase.phase);})[0];
							return result;
						}),
					sensors: {},
					controls: {},
					sensorDisplayOrder : ['ph','water','air','full','ec','tds','sal','hum','lux','ir','vis']
				};


				if (currentGrowPlanInstance.device){
					activeControlActions.forEach(function(controlAction){
						var control = controls.filter(function(item){return item._id.equals(controlAction.control);})[0];
						// HACK : pretending there cannot be more than one controlAction per control. probably a good assumption but it's not yet enforced anywhere
						locals.controls[control.name] = {
							name: control.name,
							className : control.name.replace(/\s/g,'').toLowerCase(),
							id : control._id, // TODO : decide whether to make this a friendly id
							action : {
								description : controlAction.description,
								cycle : controlAction.cycle,
								cycleString : ActionUtils.updateCycleTemplateWithStates('{value1},{duration1},{value2},{duration2}', controlAction.cycle.states).cycleString
							}
						};
					});
				}

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
					if (locals.sensors[idealRange.sCode]){
						var ir = {
							valueRange : idealRange.valueRange
						};
						if (idealRange.applicableTimeSpan){
							// TODO : parse. And use this to determine whether
							// the sensor is in range, then add some sort of property
							// to the sensor to indicate it 
						}
						locals.sensors[idealRange.sCode].idealRange = ir;	
					}
				});

				// Sort the sensor logs in descending timestamp order. 
				// TODO : Figure out if this is necessary. There's an index
				// on sensorLogs.timestamp so maybe it's already in some sort 
				// of order
				var sortedSensorLogs = currentGrowPlanInstance.recentSensorLogs.sort(function(logA, logB){
					return ( (logA.ts > logB) ? -1 : 1);
				});

				sortedSensorLogs.forEach(function(sensorsLog){
					sensorsLog.logs.forEach(function(log){
						// HACK : we shouldn't need to check for existence of this sensor code in the hash
						// once validation's setup in /api/devices/id/sensor_logs, remove the if(...) check
						if (locals.sensors[log.sCode]){
							locals.sensors[log.sCode].logs.push({
								timestamp : sensorsLog.ts,
								value : log.val
							});	
						}
					});
				});
				

				locals.title = 'Bitponics - Dashboard';
				locals.className = 'dashboard';
				locals.user = req.user;
				locals.activeGrowPlanInstances = growPlanInstances;
				locals.currentGrowPlanInstance = currentGrowPlanInstance;

				res.render('dashboard', locals);
			}
		);
	});
};	

