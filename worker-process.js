#! /usr/bin/env node

var environment = process.argv.slice(2)[0], //gets first cmd line arg
	cronJob = require('cron').CronJob,
	winston = require('winston'),
	mongoose = require('mongoose'),
	async = require('async'),
	moment = require('moment'),
	winston = require('winston'),
	mongooseConnection = require('./config/mongoose-connection').open(environment),
	ModelUtils = require('./models/utils'),
	NotificationModel = require('./models/notification').model,
	GrowPlanInstanceModel = require('./models/growPlanInstance').model,
	PhotoModel = require('./models/photo').model;
	

mongooseConnection.open(environment);


/**
 * Once a day at 00:00
 * - phase advancement checks. Should eventually be switched to every hour to handle all timezones
 *
 */
new cronJob('0 0 0 * * *', function(){
    var now = moment();
    console.log('Every day at 00:00, starting at ' + now.format());
    
    ModelUtils.scanForPhaseChanges(GrowPlanInstanceModel, function(err, count){
    	if (err) { console.log(err); }
    	var finishedEnvironmentAt = moment();
    	console.log(environment + ' ModelUtils.scanForPhaseChanges started at ' + now.format() + ', ended at ' + finishedEnvironmentAt.format() + ', duration ' + now.diff(finishedEnvironmentAt) + 'ms');
    	console.log((count || 0) + " records affected");
    });
    
}, null, true, "America/New_York");



/**
 * Every 10 minutes
 * - Fetch email photos
 */
//  new cronJob('00 */10 * * * * ', function(){
//     var now = moment(),
//     		emailPhotoFetcher = require('./utils/email-photo-fetcher');

//     console.log('Every 10 minutes, starting at ' + now.format());

// 		emailPhotoFetcher.processUnreadEmails(PhotoModel, function(err, results){
// 			if (err) { console.log(err); }
//     	var finishedEnvironmentAt = moment();
//     	console.log('production emailPhotoFetcher.processUnreadEmails started at ' + now.format() + ', ended at ' + finishedEnvironmentAt.format() + ', duration ' + now.diff(finishedEnvironmentAt) + 'ms');
//     	console.log((results ? results.length : 0) + " email images processed");
// 		});    		
    
// }, null, true, "America/New_York");




/**
 * Every 20 minutes
 * - Check device connections
 */
 new cronJob('00 */20 * * * * ', function(){
    var now = moment();

    console.log('Every 20 minutes, starting at ' + now.format());

    ModelUtils.checkDeviceConnections(function(err, count){
        if (err) { console.log(err); }
        var finishedEnvironmentAt = moment();
        console.log(environment + ' ModelUtils.checkDeviceConnections started at ' + now.format() + ', ended at ' + finishedEnvironmentAt.format() + ', duration ' + now.diff(finishedEnvironmentAt) + 'ms');
        console.log((count || 0) + " records affected");
    });

}, null, true, "America/New_York");


/**
 * Every 10 minutes
 * - Fetch FTP photos
 */
 new cronJob('00 */10 * * * * ', function(){
    var now = moment(),
    		ftpPhotoFetcher = require('./utils/ftp-photo-fetcher');

    console.log('Every 10 minutes, starting at ' + now.format());

	ftpPhotoFetcher.processNewPhotos(PhotoModel, function(err, results){
		if (err) { console.log(err); }
    	var finishedEnvironmentAt = moment();
    	console.log(environment + 'ftpPhotoFetcher.processNewPhotos started at ' + now.format() + ', ended at ' + finishedEnvironmentAt.format() + ', duration ' + now.diff(finishedEnvironmentAt) + 'ms');
    	console.log((results ? results.length : 0) + " images processed");
	});    		

}, null, true, "America/New_York");



/**
 * Every 5 minutes
 * - Clearing pending Notifications
 */
 new cronJob('00 */5 * * * * ', function(){
    var now = moment();
    console.log('Every 5 minutes, starting at ' + now.format());

	ModelUtils.clearPendingNotifications(NotificationModel, function(err, count){
		if (err) { console.log(err); }
    	
    	var finishedEnvironmentAt = moment();
    	console.log(environment + ' ModelUtils.clearPendingNotifications started at ' + now.format() + ', ended at ' + finishedEnvironmentAt.format() + ', duration ' + now.diff(finishedEnvironmentAt) + 'ms');
    	console.log((count || 0) + " records affected");
    });
    
}, null, true, "America/New_York");




console.log('Started worker');


setInterval(function(){
	var x = 'break here';
}, 1000);
