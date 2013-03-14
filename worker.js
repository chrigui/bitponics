var cronJob = require('cron').CronJob,
	ModelUtils = require('./models/utils'),
	winston = require('winston'),
	mongoose = require('mongoose'),
	async = require('async'),
	mongoUrls = require('./config/mongo-config').urls;

var environments = ['local','dev','staging','prod'];

var connections = {
	local : mongoose.createConnection(mongoUrls.local),
	dev : mongoose.createConnection(mongoUrls.development),
	staging : mongoose.createConnection(mongoUrls.staging),
	prod : mongoose.createConnection(mongoUrls.production)
};

var notificationModels = {
	local : connections.local.model('Notification', require('./models/notification').schema),
	dev : connections.dev.model('Notification', require('./models/notification').schema),
	staging : connections.staging.model('Notification', require('./models/notification').schema),
	prod : connections.prod.model('Notification', require('./models/notification').schema),
};

var growPlanInstanceModels = {
	local : connections.local.model('GrowPlanInstance', require('./models/growPlanInstance').schema),
	dev : connections.dev.model('GrowPlanInstance', require('./models/growPlanInstance').schema),
	staging : connections.staging.model('GrowPlanInstance', require('./models/growPlanInstance').schema),
	prod : connections.prod.model('GrowPlanInstance', require('./models/growPlanInstance').schema),
};

/**
 * Once a day at 00:00
 * - phase advancement checks. Should eventually be switched to every hour to handle all timezones
 *
 */
new cronJob('0 0 0 * * *', function(){
    var now = new Date();
    console.log('Every day at 00:00, starting at ' + now.toString());
    async.forEach(
    	environments,
    	function(env, iteratorCallback){
    		ModelUtils.scanForPhaseChanges(growPlanInstanceModels[env], function(err){
		    	if (err) { console.log(err); }
		    	console.log(env + ' ModelUtils.scanForPhaseChanges started at ' + now.toString() + ', ended at ' + (new Date()).toString());
		    });
    	},
    	function(err){
    		if (err) { return console.log(err); }
    	}
	);
    
}, null, true, "America/New_York");


/**
 * Every 5 minutes
 * - Clearing pending Notifications
 */
 new cronJob('00 */5 * * * * ', function(){
    var now = new Date();
    console.log('Every 5 minutes, starting at ' + now.toString());
	async.forEach(
    	environments,
    	function(env, iteratorCallback){
    		ModelUtils.clearPendingNotifications(notificationModels[env], function(err){
		    	if (err) { console.log(err); }
		    	console.log(env + ' ModelUtils.clearPendingNotifications started at ' + now.toString() + ', ended at ' + (new Date()).toString());
		    });
    	},
    	function(err){
    		if (err) { return console.log(err); }
    	}
	);
}, null, true, "America/New_York");

 console.log('Started worker');

 setInterval(function(){
 	var x = 'break here';
 }, 1000);