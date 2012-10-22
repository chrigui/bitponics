var GrowPlanInstanceModel = require('../models/growPlanInstance').model,
  GrowPlanModel = require('../models/growPlan').growPlan.model,
  UserModel = require('../models/user').model,
  PlantModel = require('../models/plant').model,
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
			growPlans: {},
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
					//get all grow plans and populate
					async.series(
						[
							function (innerCallback) {
								GrowPlanModel.find({ visibility: 'public' })
								.populate('controls')
								.populate('sensors')
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
								locals.growPlans.forEach(function(growPlan) {
									growPlan.phases.forEach(function(phase) {
										phase.idealRanges.forEach(function(idealRange) {
											// ActionModel.findById(idealRange.actionAboveMax, function (err, action) {
											// 	if (err) { next(err); }
											// 	console.log('actionAboveMax');
											// 	console.log(action);
											// });
											// ActionModel.findById(idealRange.actionBelowMin, function (err, action) {
											// 	if (err) { next(err); }
											// 	console.log('actionBelowMin');
											// 	console.log(action);
											// });
										});
									});
								});
								innerCallback(null);
							}
						],
						function (err, result) {
							callback();
						}
					)
				}
			],
			function parallelFinal(err, result){
				if (err) { return next(err); }
				
				locals.growSystems = result[0];
				locals.plants = result[1];
				// locals.growPlans = result[2];

				//single out the default grow plan
				locals.growPlans.forEach(function (item, index) {
					if(item.name === 'All-Purpose'){
						locals.growPlanDefault = item;
						locals.growPlans.splice(index, 1); //remove default from general list of grow plans

						// item.phases.forEach(function (phase, index) {
						// 	var days = phase.expectedNumberOfDays ? phase.expectedNumberOfDays : 28; //use 28 as default phase length?
						// 	locals.growPlanDefault.estimatedDuration += days;
						// });
						// console.log('locals.growPlanDefault.estimatedDuration: '+locals.growPlanDefault.estimatedDuration);
					}
				});

				res.render('growplans', locals);
			}
		)
	});

	app.post('/growplans', function (req, res) {
		var user = req.user,
			growplans = req.body.growplan;

		// GrowPlanInstanceModel.findAndModify({
  //   	query : { $in: { growPlan: growplans }},
  //   	update : { $push : { users: user.id }},
  //   	function (err, gps) {
  //   		if (err) { return next(err); }
    		return res.redirect('/growplans'); //TODO: add flash message notifying user of update
    // 	}
   	// });

	});

}