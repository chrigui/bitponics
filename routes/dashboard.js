var ControlModel = require('../models/control').model,
GrowPlanModel = require('../models/growPlan').growPlan.model,
GrowPlanInstanceModel = require('../models/garden').model,
SensorModel = require('../models/sensor').model,
Action = require('../models/action'),
ActionModel = Action.model,
routeUtils = require('./route-utils'),
winston = require('winston'),
async = require('async'); 

module.exports = function(app){
		
	// TEMP : redirect /dashboard to /gardens until we refactor /dashboard
	// to use the updated angularized dashboard code (reuse templates/js at /gardens/:growPlanInstanceId)
	app.get('/dashboard', 
		function(req, res, next){
			res.redirect('/gardens');
		}
	);
};	

