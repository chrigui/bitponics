#! /usr/bin/env node

/*
 * db_init
 * https://github.com/Bitponics/bitponics
 *
 * Copyright (c) 2012 Jack Bishop
 * Licensed under the MIT license.
 *
 *
 * Setup:
 *   1. $ cd bitponics/utils/db_init
 *   2. $ npm link
 *
 * Usage:
 *   1. $ db_init [local|dev|staging|mongodb://whatever-db-you-need] [clear]
 *   
 *   example: 
 *		$ db_init local
 *   example with clear:
 *		$ db_init dev clear
 *  
 *	 This script optionally removes all collections, then adds data from /bitponics/utils/db_init/seed_data/.
 *
 */

//TODO: separate device script

var mongoose   = require('mongoose'),
async = require('async'),
models = require('../../../models'),
mongoUrls = require('../../../config/mongo-config').urls,
	db_url = process.argv.slice(2)[0], //get's first cmd line arg
	clear = process.argv.slice(2)[1], //get's second cmd line arg
	data = require('../seed_data'),
	appDomains = require('../../../config/app-domain-config'),
	appDomain = 'bitponics.com',
	dataType = undefined,
	savedObjectIds = {
		sensors: {},
		nutrients: {},
		deviceTypes: {},
		devices: {},
		lightBulbs: {},
		lightFixtures: {},
		growSystems: {},
		plants: {},
		controls: {},
		actions: {},
		growPlans: {},
		growPlanInstances: {},
		users: {},
		sensorLogs: {}
	};

	switch(db_url){
		case 'local':
		db_url = mongoUrls.local;
		appDomain = appDomains.local;
		break;
		case 'dev':
		db_url = mongoUrls.development;
		appDomain = appDomains.development;
		break;
		case 'staging':
		db_url = mongoUrls.staging;
		appDomain = appDomains.staging;
		break;
		default:
		// if not one of those, assume it was a mongodb:// url, so leave it alone
	}

	console.log(db_url);
	console.log(clear);
	// console.log(data);

mongoose.connect(db_url);

/**
 * Run data operations in series using async lib
 */
 async.series([
 	function(callback){
		/**
		 * clear old data in parallel if clear option
		 */
		 if(clear) {
		 	async.parallel([
		 		function(innerCallback){
		 			if (!mongoose.connection.collections['users']){ return innerCallback();}
		 			mongoose.connection.collections['users'].drop( function(err) {
		 				if (err){ return innerCallback(err);}
		 				console.log('users collection dropped');
		 				innerCallback();
		 			});
		 		},
		 		function(innerCallback){
		 			if (!mongoose.connection.collections['sensors']){ return innerCallback();}
		 			mongoose.connection.collections['sensors'].drop( function(err) {
		 				if (err){ return innerCallback(err);}
		 				console.log('sensors collection dropped');
		 				innerCallback();
		 			});
		 		},
		 		function(innerCallback){
		 			if (!mongoose.connection.collections['nutrients']){ return innerCallback();}
		 			mongoose.connection.collections['nutrients'].drop( function(err) {
		 				if (err){ return innerCallback(err);}
		 				console.log('nutrients collection dropped');
		 				innerCallback();
		 			});
		 		},
		 		function(innerCallback){
		 			if (!mongoose.connection.collections['devicetypes']){ return innerCallback();}
		 			mongoose.connection.collections['devicetypes'].drop( function(err) {
		 				if (err){ return innerCallback(err);}
		 				console.log('devicetypes collection dropped');
		 				innerCallback();
		 			});
		 		},
		 		function(innerCallback){
		 			if (!mongoose.connection.collections['devices']){ return innerCallback();}
		 			mongoose.connection.collections['devices'].drop( function(err) {
		 				if (err){ return innerCallback(err);}
		 				console.log('devices collection dropped');
		 				innerCallback();
		 			});
		 		},
		 		function(innerCallback){
		 			if (!mongoose.connection.collections['lightbulbs']){ return innerCallback();}
		 			mongoose.connection.collections['lightbulbs'].drop( function(err) {
		 				if (err){ return innerCallback(err);}
		 				console.log('lightbulbs collection dropped');
		 				innerCallback();
		 			});

		 		},
		 		function(innerCallback){
		 			if (!mongoose.connection.collections['lightfixtures']){ return innerCallback();}
		 			mongoose.connection.collections['lightfixtures'].drop( function(err) {
		 				if (err){ return innerCallback(err);}
		 				console.log('lightfixtures collection dropped');
		 				innerCallback();
		 			});

		 		},
		 		function(innerCallback){
		 			if (!mongoose.connection.collections['growsystems']){ return innerCallback();}
		 			mongoose.connection.collections['growsystems'].drop( function(err) {
		 				if (err){ return innerCallback(err);}
		 				console.log('growsystems collection dropped');
		 				innerCallback();
		 			});

		 		},
		 		function(innerCallback){
		 			if (!mongoose.connection.collections['controls']){ return innerCallback();}
		 			mongoose.connection.collections['controls'].drop( function(err) {
		 				if (err){ return innerCallback(err);}
		 				console.log('controls collection dropped');
		 				innerCallback();
		 			});
		 		},
		 		function(innerCallback){
		 			if (!mongoose.connection.collections['actions']){ return innerCallback();}
		 			mongoose.connection.collections['actions'].drop( function(err) {
		 				if (err){ return innerCallback(err);}
		 				console.log('actions collection dropped');
		 				innerCallback();
		 			});
		 		},
		 		function(innerCallback){
		 			if (!mongoose.connection.collections['growplans']){ return innerCallback();}
		 			mongoose.connection.collections['growplans'].drop( function(err) {
		 				if (err){ return innerCallback(err);}
		 				console.log('growplans collection dropped');
		 				innerCallback();
		 			});
		 		},
		 		function(innerCallback){
		 			if (!mongoose.connection.collections['growplaninstances']){ return innerCallback();}
		 			mongoose.connection.collections['growplaninstances'].drop( function(err) {
		 				if (err){ return innerCallback(err);}
		 				console.log('growplaninstances collection dropped');
		 				innerCallback();
		 			});
		 		},
		 		function(innerCallback){
		 			if (!mongoose.connection.collections['sensorlogs']){ return innerCallback();}
		 			mongoose.connection.collections['sensorlogs'].drop( function(err) {
		 				if (err){ return innerCallback(err);}
		 				console.log('sensorlogs collection dropped');
		 				innerCallback();
		 			});
		 		}
		 		],
		 		function(err, results){
		 			callback(null, null);
		 		}
		 		);
} else {
	callback();
}
},

function(callback){
        /**
		 * Users
		 */

		 var dataType = 'users',
		 dataCount = data[dataType].length,
		 decrementData = function(){
		 	dataCount--;
		 	if (dataCount === 0){
		 		callback();
		 	}
		 };

		 console.log('####### ' + dataType + ' #######');

		 data[dataType].forEach(function(_data){
		 	models.user.findById(_data._id, function(err, user){
		 		if (err) { console.log(err); return callback(err);}
		 		if (user){
		 			decrementData();
		 		} else {
		 			models.user.createUserWithPassword({
		 				_id : _data._id,
		 				email : _data.email,
		 				name : _data.name,
		 				locale: _data.locale,
		 				active : _data.active,
		 				admin :  _data.admin,
		 				activationToken : _data.activationToken,
		 				sentEmail : _data.sentEmail,
		 				deviceKey : _data.deviceKey,
		 				apiKey : _data.apiKey
		 			},
					"8bitpass", //default password
					function(err, user){
						if (err) { console.log(err); return callback(err);}
						savedObjectIds[dataType][_data.email] = user.id;
						console.log("created user");
						decrementData();
					});
		 		}
		 	});
		 });
		},

		function(callback){
        /**
		 * Sensors
		 */
		 var dataType = 'sensors',
		 dataCount = data[dataType].length,
		 decrementData = function(){
		 	dataCount--;
		 	if (dataCount === 0){
		 		callback();
		 	}
		 };

		 console.log('####### ' + dataType + ' #######');

		 data[dataType].forEach(function(_data){
		 	models.sensor.findById(_data._id, function(err, result){
		 		if (err) { console.log(err); return callback(err);}
		 		if (result){
		 			decrementData();
		 		} else {
		 			var dataObj = new models.sensor({
		 				_id : _data._id,
		 				name: _data.name,
		 				abbrev: _data.abbrev,
		 				unit: _data.unit,
		 				code: _data.code,
		 				visible : _data.visible
		 			});

		 			dataObj.save(function (err, doc) {
		 				if (err) { console.log(err); return callback(err);}
		 				savedObjectIds[dataType][_data.code] = doc.id;
		 				console.log("created sensor");
		 				decrementData();
		 			});		
		 		}
		 	})
		 });
		},

		function(callback){
        /**
		 * Controls
		 */
		 var dataType = 'controls',
		 dataCount = data[dataType].length,
		 decrementData = function(){
		 	dataCount--;
		 	if (dataCount === 0){
		 		callback();
		 	}
		 };

		 console.log('####### ' + dataType + ' #######');

		 data[dataType].forEach(function(_data){
		 	models.control.findById(_data._id, function(err, result){
		 		if (err) { console.log(err); return callback(err);}
		 		if (result){
		 			decrementData();
		 		} else {
		 			var dataObj = new models.control({
		 				_id : _data._id,
		 				name: _data.name
		 			});
		 			dataObj.save(function (err, doc) {
		 				if (err) { console.log(err); return callback(err);}
		 				savedObjectIds[dataType][_data.name] = doc.id;
		 				console.log("created controls");
		 				decrementData();
		 			});
		 		}
		 	});
		 });
		},

		function(callback){
        /**
		 * Nutrients
		 */
		 var dataType = 'nutrients',
		 dataCount = data[dataType].length,
		 decrementData = function(){
		 	dataCount--;
		 	if (dataCount === 0){
		 		callback();
		 	}
		 };

		 console.log('####### ' + dataType + ' #######');

		 data[dataType].forEach(function(_data){
		 	models.nutrient.findById(_data._id, function(err, result){
		 		if (err) { console.log(err); return callback(err);}
		 		if (result){
		 			decrementData();
		 		} else {
		 			var dataObj = new models.nutrient({
		 				_id : _data._id,
		 				name: _data.name,
		 				brand: _data.brand
		 			});

		 			dataObj.save(function (err, doc) {
		 				if (err) { console.log(err); return callback(err);}
		 				savedObjectIds[dataType][_data.name] = doc.id;
		 				console.log("created sensor");
		 				decrementData();
		 			});
		 		}
		 	});


		 });
		},

		function(callback){
        /**
		 * Device Types
		 */
		 var dataType = 'deviceTypes',
		 dataCount = data[dataType].length,
		 decrementData = function(){
		 	dataCount--;
		 	if (dataCount === 0){
		 		callback();
		 	}
		 };

		 console.log('####### ' + dataType + ' #######');

		 data[dataType].forEach(function(_data){

		 	models.deviceType.findById(_data._id, function(err, result){
		 		if (err) { console.log(err); return callback(err);}
		 		if (result){
		 			decrementData();
		 		} else {
		 			var dataObj = new models.deviceType({
		 				_id : _data._id,
		 				name: _data.name,
		 				firmwareVersion: _data.firmwareVersion,
		 				microprocessor: _data.microprocessor,
		 				sensorMap: _data.sensorMap
		 			});

		 			dataObj.save(function (err, doc) {
		 				if (err) { console.log(err); return callback(err);}
		 				savedObjectIds[dataType][_data.name] = doc.id;
		 				console.log("created: " + dataType);
		 				decrementData();
		 			});
		 		}
		 	});

		 });
		},

		function(callback){
        /**
		 * Devices
		 */
		 var dataType = 'devices',
		 dataCount = data[dataType].length,
		 decrementData = function(){
		 	dataCount--;
		 	if (dataCount === 0){
		 		callback();
		 	}
		 };

		 console.log('####### ' + dataType + ' #######');

		 data[dataType].forEach(function(_data){

		 	models.device.findById(_data._id, function(err, result){
		 		if (err) { console.log(err); return callback(err);}
		 		if (result){
		 			decrementData();
		 		} else {
		 			var dataObj = new models.device({
		 				_id : _data._id,
		 				deviceId: _data.deviceId,
		 				deviceType: _data.deviceType,
		 				name : _data.name,
		 				owner: _data.owner,
		 				users : _data.users,
		 				sensorMap : _data.sensorMap,
		 				controlMap : _data.controlMap,
		 				recentSensorLogs: _data.recentSensorLogs,
		 				activeGrowPlanInstance : _data.activeGrowPlanInstance
		 			});

		 			dataObj.save(function (err, doc) {
		 				if (err) { console.log(err); return callback(err);}
		 				savedObjectIds[dataType][_data.deviceId] = doc.id;
		 				console.log("created: " + dataType);
		 				decrementData();
		 			});
		 		}
		 	});
		 });
		},
		
		function(callback){
        /**
		 * LightBulbs
		 */
		 var dataType = 'lightBulbs',
		 dataCount = data[dataType].length,
		 decrementData = function(){
		 	dataCount--;
		 	if (dataCount === 0){
		 		callback();
		 	}
		 };

		 console.log('####### ' + dataType + ' #######');

		 data[dataType].forEach(function(_data){
		 	models.lightBulb.findById(_data._id, function(err, result){
		 		if (err) { console.log(err); return callback(err);}
		 		if (result){
		 			decrementData();
		 		} else {
		 			var dataObj = new models.lightBulb({
		 				_id : _data._id,
		 				type: _data.type,
		 				watts: _data.watts,
		 				brand: _data.brand,
		 				name: _data.name
		 			});
		 			dataObj.save(function (err, doc) {
		 				if (err) { console.log(err); return callback(err);}
		 				savedObjectIds[dataType][_data.name] = doc.id;
		 				console.log("created lightBulb");
		 				decrementData();
		 			});
		 		}
		 	});
		 });
		},
		
		function(callback){
        /**
		 * LightFixtures
		 */
		 var dataType = 'lightFixtures',
		 dataCount = data[dataType].length,
		 decrementData = function(){
		 	dataCount--;
		 	if (dataCount === 0){
		 		callback();
		 	}
		 };

		 console.log('####### ' + dataType + ' #######');

		 data[dataType].forEach(function(_data){
		 	models.lightFixture.findById(_data._id, function(err, result){
		 		if (err) { console.log(err); return callback(err);}
		 		if (result){
		 			decrementData();
		 		} else {
		 			var dataObj = new models.lightFixture({
		 				_id : _data._id,
		 				type: _data.type,
		 				watts: _data.watts,
		 				brand: _data.brand,
		 				name: _data.name,
		 				bulbCapacity: _data.bulbCapacity
		 			});
		 			dataObj.save(function (err, doc) {
		 				if (err) { console.log(err); return callback(err);}
		 				savedObjectIds[dataType][_data.name] = doc.id;
		 				console.log("created lightFixture");
		 				decrementData();
		 			});
		 		}
		 	});
		 });
		},

		function(callback){
        /**
		 * Grow Systems
		 */
		 var dataType = 'growSystems',
		 dataCount = data[dataType].length,
		 decrementData = function(){
		 	dataCount--;
		 	if (dataCount === 0){
		 		callback();
		 	}
		 };

		 console.log('####### ' + dataType + ' #######');

		 data[dataType].forEach(function(_data){
		 	models.growSystem.findById(_data._id, function(err, result){
		 		if (err) { console.log(err); return callback(err);}
		 		if (result){
		 			decrementData();
		 		} else {
		 			var dataObj = new models.growSystem({
		 				_id : _data._id,
		 				name: _data.name,
		 				description: _data.description,
		 				type: _data.type,
		 				reservoirSize: _data.reservoirSize,
		 				plantCapacity: _data.plantCapacity
		 			});
		 			dataObj.save(function (err, doc) {
		 				if (err) { console.log(err); return callback(err);}
		 				savedObjectIds[dataType][_data.name] = doc.id;
		 				console.log("created grow system");
		 				decrementData();
		 			});
		 		}
		 	});
		 });
		},

		function(callback){
   	/**
		 * Plants
		 */
		 var dataType = 'plants',
		 dataCount = data[dataType].length,
		 decrementData = function(){
		 	dataCount--;
		 	if (dataCount === 0){
		 		callback();
		 	}
		 };

		 console.log('####### ' + dataType + ' #######');

		 data[dataType].forEach(function(_data){
		 	models.plant.findById(_data._id, function(err, result){
		 		if (err) { console.log(err); return callback(err);}
		 		if (result){
		 			decrementData();
		 		} else {
		 			var dataObj = new models.plant({
		 				_id : _data._id,
		 				name: _data.name
		 			});
		 			dataObj.save(function (err, doc) {
		 				if (err) { console.log(err); return callback(err);}
		 				savedObjectIds[dataType][_data.name] = doc.id;
		 				console.log("created plant");
		 				decrementData();
		 			});
		 		}
		 	});
		 });
		},

		function(callback){
        /**
		 * Actions
		 */
		 var dataType = 'actions',
		 dataCount = data[dataType].length,
		 decrementData = function(){
		 	dataCount--;
		 	if (dataCount === 0){
		 		callback();
		 	}
		 };

		 console.log('####### ' + dataType + ' #######');

		 data[dataType].forEach(function(_data){
		 	models.action.findById(_data._id, function(err, result){
		 		if (err) { console.log(err); return callback(err);}
		 		if (result){
		 			decrementData();
		 		} else {
		 			var dataObj = new models.action({
		 				_id : _data._id,
		 				description: _data.description,
		 				control: _data.control,
		 				cycle: _data.cycle
		 			});
		 			dataObj.save(function (err, doc) {
		 				if (err) { console.log(err); return callback(err);}			 			
		 				savedObjectIds[dataType][_data.description] = doc.id;
		 				console.log("created action");
		 				decrementData();
		 			});
		 		}
		 	});
		 });
		},

		
		

		function(callback){
        /**
		 * Grow Plans
		 */

		 var dataType = 'growPlans',
		 dataCount = data[dataType].length,
		 decrementData = function(){
		 	dataCount--;
		 	if (dataCount === 0){
		 		callback();
		 	}
		 };

		 console.log('####### ' + dataType + ' #######');

		 data[dataType].forEach(function(_data){
		 	models.growPlan.findById(_data._id, function(err, result){
		 		if (err) { console.log(err); return callback(err);}
		 		if (result){
		 			decrementData();
		 		} else {
		 			var dataObj = new models.growPlan({
		 				_id : _data._id,
		 				createdBy: _data.createdBy,
		 				name: _data.name,
		 				description: _data.description,
		 				plants: _data.plants,
		 				expertiseLevel: _data.expertiseLevel,
		 				sensors: _data.sensors,
		 				controls: _data.controls,
		 				phases: _data.phases
		 			});

		 			dataObj.save(function (err, doc) {
		 				if (err) { console.log(err); return callback(err);}
		 				savedObjectIds[dataType][_data.name] = doc.id;
		 				console.log("created phase");
		 				decrementData();
		 			});
		 		}
		 	});
		 });
		},

		function(callback){
        /**
		 * Grow Plan Instances
		 */

		 var dataType = 'growPlanInstances',
		 dataCount = data[dataType].length,
		 decrementData = function(){
		 	dataCount--;
		 	if (dataCount === 0){
		 		callback();
		 	}
		 };

		 console.log('####### ' + dataType + ' #######');

		 data[dataType].forEach(function(_data){
		 	models.growPlanInstance.findById(_data._id, function(err, result){
		 		if (err) { console.log(err); return callback(err);}
		 		if (result){
		 			decrementData();
		 		} else {
		 			var dataObj = new models.growPlanInstance({
		 				_id : _data._id,
		 				users: _data.users,
		 				owner : _data.owner,
		 				growPlan: _data.growPlan,
		 				device: _data.device,
		 				startDate: _data.startDate,
		 				endDate: _data.endDate,
		 				active: _data.active,
		 				phases: _data.phases,
		 				recentSensorLogs: _data.recentSensorLogs,
		 				recentPhotoLogs: _data.recentPhotLogs,
		 				recentTagLogs: _data.recentTagLogs
		 			});

		 			dataObj.save(function (err, doc) {
		 				if (err) { console.log(err); return callback(err);}
		 				savedObjectIds[dataType][_data._id] = doc.id;
		 				console.log("created grow plan instance");

		 				if (dataObj.active){
		 					console.log('pairing grow plan instance with device');
		 					models.utils.activateGrowPlanInstance(doc, function(err){
		 						if (err) { console.log(err); return callback(err);}
		 						decrementData();
		 					});		      
		 				} else {
		 					decrementData();
		 				}

		 			});
		 		}
		 	});
		});
	},

	function(callback){
        /**
		 * Sensor Logs
		 */

		 var dataType = 'sensorLogs',
		 dataCount = data[dataType].length,
		 decrementData = function(){
		 	dataCount--;
		 	if (dataCount === 0){
		 		callback();
		 	}
		 };

		 console.log('####### ' + dataType + ' #######');

		 data[dataType].forEach(function(_data){
		 	models.sensorLog.findById(_data._id, function(err, result){
		 		if (err) { console.log(err); return callback(err);}
		 		if (result){
		 			decrementData();
		 		} else {
		 			var dataObj = new models.sensorLog({
		 				_id : _data._id,
		 				gpi: _data.gpi,
		 				ts : _data.ts,
		 				logs : _data.logs
		 			});

		 			dataObj.save(function (err, doc) {
		 				if (err) { console.log(err); return callback(err);}
		 				savedObjectIds[dataType][doc.id] = doc.id;
		 				console.log("created sensor log");
		 				decrementData();
		 			});
		 		}
		 	});
		 });
		}
		],
		function(err, results){
			console.log('ALL DONE');
			if(err){
				console.log('FAILED');
				console.log(err);
				process.exit(1);
			} else {
				console.log('SUCCEEDED');
				process.exit(0);
			}
		}
		);
