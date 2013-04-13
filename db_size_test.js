var cronJob = require('cron').CronJob,
	winston = require('winston'),
	mongoose = require('mongoose'),
	async = require('async');

require('./config/mongoose-connection').open('test');

var Models = require('./models'),
	ModelUtils = Models.utils;

console.log('Started');

var now = Date.now();

// Determining estimate for 1 year of user data. 

// Serious Grower Plan : logs every 15 minutes
// Industrial Grower : logs every 5 minutes

// GPI
// SensorLogs : (minutes in a day / log frequency in minutes) * 365)
// TagLogs : 365
// PhotoLogs: 24 * 365
// ImmediateActions

var minuteFrequency = 15;
// minutes per day = 24 * 60
var iterations = (24 * 60) / minuteFrequency * 365; // = 35040


//var arr = [];

//35040 for 1 year of 15 minute logs
//iterations = 20000;//15040;
//iterations = 15040;
iterations = 1;


for (var i = 0, i2 = 0; i < iterations; i++){
	//arr[i] = i;

	console.log(i);

	var ts = now + (i * (minuteFrequency * 60 * 1000));

	var sensorLog = new Models.sensorLog({
		gpi : "506de2fe8eebf7524342cb38",
		ts: ts,
		logs : [
			{
				sCode: "ph",
				val : 6.25
			},
			{
				sCode: "air",
				val: 30
			},
			{
				sCode: "water",
				val: 35
			},
			{
				sCode : "ec",
				val: 1000000
			},
			{
				sCode : "hum",
				val: 50
			},
			{ 
				sCode : "full",
				val : 3232.32
			},
			{ 
				sCode : "ir",
				val : 3232.32
			},
			{ 
				sCode : "vis",
				val : 3232.32
			},
			{ 
				sCode : "lux",
				val : 3232.32
			}
		]
	});
	sensorLog.save(function(){ console.log('done saving sensor log' + i2++);});
}


/*
async.forEach(arr, 
	function sensorLogIterator(i, callback){
		callback();		
	},
	function allDone(err){
		console.log('done');
	}
);
*/