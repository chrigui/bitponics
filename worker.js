var cronJob = require('cron').CronJob,
	GrowPlanModel = require('models/growPlan').growPlan.model,
	GrowPlanInstanceModel = require('models/growPlanInstance').model;

/**
 * Every hour at :00
 * - phase advancement checks
 *
 */
new cronJob('0 * * * * *', function(){
    console.log('Every hour at :00');


}, null, true, "America/New_York");


/**
 * Every 5 minutes
 * - Clearing pending Notifications
 */
 new cronJob('*/5 * * * * *', function(){
    console.log('Every 5 minutes');


}, null, true, "America/New_York");