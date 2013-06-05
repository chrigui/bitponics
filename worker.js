var cronJob = require('cron').CronJob,
	ModelUtils = require('./models/utils'),
	winston = require('winston'),
	mongoose = require('mongoose'),
	async = require('async'),
	moment = require('moment'),
	winston = require('winston'),
	mongooseConnection = require('./config/mongoose-connection');
	

var environments = ['local','development','staging','production'];
//var environments = ['production'];


var connections = {},
		notificationModels = {},
		growPlanInstanceModels = {},
		photoModels = {};


// Have to create the connections in series or we get weird auth errors
async.eachSeries(
	environments,
	

	function connectEnvironmentIterator(environment, iteratorCallback){
		mongooseConnection.open(environment, function(err, connection){
			connections[environment] = connection;
			
			notificationModels[environment] = connection.model('Notification', require('./models/notification').schema);
			growPlanInstanceModels[environment] = connection.model('GrowPlanInstance', require('./models/growPlanInstance').schema);
			photoModels[environment] = connection.model('Photo', require('./models/photo').schema);

			console.log('created models on connection ' + environment)
			return iteratorCallback();
		});
	},


	function connectEnvironmentLoopEnd(err){
		console.log("allEnvironmentsConnected", err);


		/**
		 * Once a day at 00:00
		 * - phase advancement checks. Should eventually be switched to every hour to handle all timezones
		 *
		 */
		new cronJob('0 0 0 * * *', function(){
		    var now = moment();
		    console.log('Every day at 00:00, starting at ' + now.format());
		    
		    async.each(
		    	environments,
		    	function(env, iteratorCallback){
		    		ModelUtils.scanForPhaseChanges(growPlanInstanceModels[env], function(err, count){
				    	if (err) { console.log(err); }
				    	var finishedEnvironmentAt = moment();
				    	console.log(env + ' ModelUtils.scanForPhaseChanges started at ' + now.format() + ', ended at ' + finishedEnvironmentAt.format() + ', duration ' + now.diff(finishedEnvironmentAt) + 'ms');
				    	console.log((count || 0) + " records affected");
				    });
		    	},
		    	function(err){
		    		console.log('Every day job that started at ' + now.toString() + ' finished in ' + now.diff(new Date()) + 'ms');
		    		if (err) { return console.log(err); }
		    	}
			);
		    
		}, null, true, "America/New_York");



		/**
		 * Every 10 minutes
		 * - Fetch email photos
		 */
		//  new cronJob('00 */10 * * * * ', function(){
		//     var now = moment(),
		//     		emailPhotoFetcher = require('./utils/email-photo-fetcher');

		//     console.log('Every 10 minutes, starting at ' + now.format());

		// 		emailPhotoFetcher.processUnreadEmails(photoModels["production"], function(err, results){
		// 			if (err) { console.log(err); }
		//     	var finishedEnvironmentAt = moment();
		//     	console.log('production emailPhotoFetcher.processUnreadEmails started at ' + now.format() + ', ended at ' + finishedEnvironmentAt.format() + ', duration ' + now.diff(finishedEnvironmentAt) + 'ms');
		//     	console.log((results ? results.length : 0) + " email images processed");
		// 		});    		
		    
		// }, null, true, "America/New_York");


		/**
		 * Every 5 minutes
		 * - Clearing pending Notifications
		 */
		 new cronJob('00 */5 * * * * ', function(){
		    var now = moment();
		    console.log('Every 5 minutes, starting at ' + now.format());

				async.each(
		    	environments,
		    	function(env, iteratorCallback){
		    		ModelUtils.clearPendingNotifications(notificationModels[env], function(err, count){
		    			//notificationModels[env].find().exec(function(err, results){
				    	if (err) { console.log(err); }
				    	
				    	var finishedEnvironmentAt = moment();
				    	console.log(env + ' ModelUtils.clearPendingNotifications started at ' + now.format() + ', ended at ' + finishedEnvironmentAt.format() + ', duration ' + now.diff(finishedEnvironmentAt) + 'ms');
				    	console.log((count || 0) + " records affected");
				    });
		    	},
		    	function(err){
		    		console.log('Every 5 minutes that started at ' + now.format() + ' finished in ' + now.diff(new Date()) + 'ms');
		    		if (err) { return console.log(err); }
		    	}
			);
		}, null, true, "America/New_York");


	}
);



 console.log('Started worker');

 
 setInterval(function(){
 	var x = 'break here';
 }, 1000);