var GrowPlanInstanceModel = require('../models/growPlanInstance').model,
  GrowPlanModel = require('../models/growPlan').model,
  UserModel = require('../models/user').model,
	winston = require('winston'),
	passport = require('passport');

module.exports = function(app){
	app.get('/growplans', function (req, res){
		var locals = {
			title : 'Grow Plans',
			className : 'growplans',
			//message : req.flash('info') //TODO: this isn't coming thru
		}

		if( !(req.user && req.user.id)){
			return res.redirect('/login');
		}

		//get all grow plans
		GrowPlanModel.find({}, function(err, gps) {
			
			console.log(gps.length);
			locals.growPlansLength = gps.length;
			locals.growPlans = gps;

			res.render('growplans', locals);
		});


		
	});

}