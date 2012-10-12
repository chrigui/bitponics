var GrowPlanInstanceModel = require('../models/growPlanInstance').model,
  GrowPlanModel = require('../models/growPlan').growPlan.model,
  UserModel = require('../models/user').model,
  PlantModel = require('../models/plant').model,
  GrowSystemModel = require('../models/growSystem').model,
	winston = require('winston'),
	passport = require('passport');

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
		}

		//get all plants
		GrowSystemModel.find({}, function(err, growSystems) {
			locals.growSystems = growSystems;

			//get all plants
			PlantModel.find({}, function(err, plants) {
				locals.plants = plants;

				//get all grow plans
				GrowPlanModel.find({}, function(err, gps) {
					locals.growPlansLength = gps.length;
					locals.growPlans = gps;

					gps.forEach(function (item) {
						if(item.name === 'All-Purpose'){
							locals.growPlanDefault = item;
						}
					});

					res.render('growplans', locals);
				});

			});
		});
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