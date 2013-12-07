var ControlModel = require('../models/control').model,
GrowPlanModel = require('../models/growPlan').growPlan.model,
GrowPlanInstanceModel = require('../models/growPlanInstance').model,
SensorModel = require('../models/sensor').model,
SensorLogModel = require('../models/sensorLog').model,
ControlModel = require('../models/control').model,
Action = require('../models/action'),
ActionModel = Action.model,
DeviceModel = require('../models/device').model,
NotificationModel = require('../models/notification').model,
PhotoModel = require('../models/photo').model,
ModelUtils = require('../models/utils'),
routeUtils = require('./route-utils'),
winston = require('winston'),
async = require('async'),
moment = require('moment'); 

module.exports = function(app){
	
	/**
	 * Dont' know what to do with this yet...just redirect to gardens
	 */
	app.get('/profiles', 
		routeUtils.middleware.ensureSecure,
		routeUtils.middleware.ensureLoggedIn,
		function (req, res, next) {
			res.redirect('/gardens');
		}
	);

	
	
	/**
	 * Show a public profile for a user
	 */
	app.get('/profiles/:id',
		routeUtils.middleware.ensureSecure,
		routeUtils.middleware.ensureLoggedIn,
		function (req, res, next) {
			var locals = {
				title : 'Bitponics - Dashboard',
				className: "app-page profile",
				pageType: "app-page",
        profileId : req.params.id
			};

      res.render('profiles/detail', locals);
		}
	);
};