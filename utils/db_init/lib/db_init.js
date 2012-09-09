#! /usr/bin/env node

/*
 * db_init
 * https://github.com/amitkumar/bitponics
 *
 * Copyright (c) 2012 Jack Bishop
 * Licensed under the MIT license.
 *
 *
 * Usage:
 *   1. cd bitponics/utils/db_init
 *   2. npm link
 *   3. db_init mongodb://whatever-db-you-need
 *   example: db_init mongodb://admin:1SHar3db1t@ds033097.mongolab.com:33097/bitponics-local
 *
 *   This script first removes all collections, then adds data from /bitponics/utils/db_init/seed_data/.
 *
 */

//TODO: separate device script
//TODO: user, phase, growPlan and growPlanInstance seed data

var mongoose   = require('mongoose'),
	async = require('async'),
	models = require('../../../models'),
	db_url = process.argv.slice(2)[0], //get's first cmd line arg
	data = require('../seed_data'),
	dataType = undefined,
	savedObjectIds = {
		sensors: {},
		nutrients: {},
		deviceTypes: {},
		lights: {},
		growSystems: {},
		controls: {},
		actions: {},
		idealRanges: {},
		phases: {},
		growPlans: {},
		growPlanInstances: {},
		users: {}
	};

console.log(db_url);
console.log(data);

mongoose.connect(db_url);

/**
 * Run data operations in series using async lib
 */
async.series([
	function(callback){
		/**
		 * clear old data in parallel
		 */
		async.parallel([
			function(innerCallback){
				models.sensor.find().remove(function(err){
					innerCallback(null,null);
				});
			},
			function(innerCallback){
				models.nutrient.find().remove(function(err){
					innerCallback(null,null);
				});
			},
			function(innerCallback){
				models.deviceType.find().remove(function(err){
					innerCallback(null,null);
				});
			},
			function(innerCallback){
				models.light.find().remove(function(err){
					innerCallback(null,null);
				});
			},
			function(innerCallback){
				models.growSystem.find().remove(function(err){
					innerCallback(null,null);
				});
			},
			function(innerCallback){
				models.control.find().remove(function(err){
					innerCallback(null,null);
				});
			},
			function(innerCallback){
				models.action.find().remove(function(err){
					innerCallback(null,null);
				});
			},
			function(innerCallback){
				models.idealRange.find().remove(function(err){
					innerCallback(null,null);
				});
			},
			function(innerCallback){
				models.phase.find().remove(function(err){
					innerCallback(null,null);
				});
			},
			function(innerCallback){
				models.growPlan.find().remove(function(err){
					innerCallback(null,null);
				});
			},
			function(innerCallback){
				models.growPlanInstance.find().remove(function(err){
					innerCallback(null,null);
				});
			}],
			function(err, results){
				callback(null, null);
			}
		);
	},
    function(callback){
        /**
		 * Sensors
		 */
		var dataType = 'sensors',
			dataCount = data[dataType].length;

		console.log('####### ' + dataType + ' #######');
		
		data[dataType].forEach(function(_data){
		    var dataObj = new models.sensor({
				name: _data.name,
				abbrev: _data.abbrev,
				unitOfMeasurement: _data.unit,
				code: _data.code
			});
			
			dataObj.save(function (err, doc) {
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
		      if (!err) {
		        console.log("created sensor");
		        savedObjectIds[dataType][_data.name] = doc.id;
		      } else {
		        console.log(err);
		      }

		    });

		});
    },
    function(callback){
        /**
		 * Nutrients
		 */
		var dataType = 'nutrients',
			dataCount = data[dataType].length;

		console.log('####### ' + dataType + ' #######');
		
		data[dataType].forEach(function(_data){
		    var dataObj = new models.nutrient({
				name: _data.name,
				brand: _data.brand
			});
			
			dataObj.save(function (err, doc) {
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
		      if (!err) {
		        console.log("created sensor");
		        savedObjectIds[dataType][_data.name] = doc.id;
		      } else {
		        console.log(err);
		      }

		    });

		});
    },
    function(callback){
        /**
		 * Device Types
		 */
		var dataType = 'deviceTypes',
			dataCount = data[dataType].length;

		console.log('####### ' + dataType + ' #######');

		data[dataType].forEach(function(_data){
			
			//first, for each type of sensor in sensorMap, get ObjectId
			models.sensor.find(function (err, sensors) {
				sensors.forEach(function(s){
					_data.sensorMap.forEach(function(ss, index){
						if(ss.outputId.toLowerCase() === s.code){
							//link sensor type to its ObjectId
							ss.sensor = s._id;
						}
					});
				});

				console.dir(_data.sensorMap);

			    var dataObj = new models.deviceType({
					name: _data.name,
					firmwareVersion: _data.firmwareVersion,
					microprocessor: _data.microprocessor,
					sensorMap: _data.sensorMap
				});

				dataObj.save(function (err, doc) {
			      if (dataCount === 1) {
			      	 callback(null, null);
			      }
			      dataCount--;
			      
			      if (!err) {
			        console.log("created: " + dataType);
			        savedObjectIds[dataType][_data.name] = doc.id;
			      } else {
			        console.log(err);
			      }

			    });
			    
			});
		});
    },
    function(callback){
        /**
		 * Lights
		 */
		var dataType = 'lights',
			dataCount = data[dataType].length;

		console.log('####### ' + dataType + ' #######');

		data[dataType].forEach(function(_data){
		    var dataObj = new models.light({
				type: _data.type,
				watts: _data.watts,
				brand: _data.brand,
				name: _data.name
			});
			dataObj.save(function (err, doc) {
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
		      if (!err) {
		        console.log("created light");
		        savedObjectIds[dataType][_data.name] = doc.id;
		      } else {
		        console.log(err);
		      }

		    });
		});
    },
    function(callback){
        /**
		 * Grow Systems
		 */
		var dataType = 'growSystems',
			dataCount = data[dataType].length;

		console.log('####### ' + dataType + ' #######');

		data[dataType].forEach(function(_data){
		    var dataObj = new models.growSystem({
				name: _data.name,
				description: _data.description,
				type: _data.type,
				reservoirSize: _data.reservoirSize,
				numberOfPlants: _data.numberOfPlants
			});
			dataObj.save(function (err, doc) {
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
		      if (!err) {
		        console.log("created grow system");
		        savedObjectIds[dataType][_data.name] = doc.id;
		      } else {
		        console.log(err);
		      }

		    });
		});
    },
    function(callback){
        /**
		 * Controls
		 */
		var dataType = 'controls',
			dataCount = data[dataType].length;

		console.log('####### ' + dataType + ' #######');

		data[dataType].forEach(function(_data){
		    var dataObj = new models.control({
				name: _data.name
			});
			dataObj.save(function (err, doc) {
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
		      if (!err) {
		        console.log("created controls");
		        savedObjectIds[dataType][_data.name] = doc.id;
		      } else {
		        console.log(err);
		      }

		    });
		});
    },
    function(callback){
        /**
		 * Actions
		 */
		var dataType = 'actions',
			dataCount = data[dataType].length;

		console.log('####### ' + dataType + ' #######');

		data[dataType].forEach(function(_data){

			if(_data.controlMessage){
				if(_data.controlMessage.controlReference){
					_data.controlMessage.controlReference = savedObjectIds['lights']['fluorescent'];
				}else{
					_data.controlMessage.controlReference = "";
				}
				if(_data.controlMessage.valueToSend){
					_data.controlMessage.valueToSend = _data.controlMessage.valueToSend;
				}else{
					_data.controlMessage.valueToSend = "";
				}
			}

		    var dataObj = new models.action({
				description: _data.description,
				controlMessage: _data.controlMessage,
				startTime: _data.startTime,
				recurrence: _data.recurrence
			});
			dataObj.save(function (err, doc) {
		      if (dataCount === 1) {
		      	savedObjectIds[dataType][_data.description] = doc.id;
		      	callback(null, null);
		      }
		      dataCount--;
		      
		      if (!err) {
		        console.log("created action");
		      } else {
		        console.log(err);
		      }

		    });
		});
    },
    function(callback){
        /**
		 * idealRanges
		 */
	
	/*	var dataType = 'idealRanges',
			dataCount = data[dataType].length;

		console.log('####### ' + dataType + ' #######');

		data[dataType].forEach(function(_data){
			
			console.log("savedObjectIds['actions']['Light levels have dropped. Turn on supplemental lighting.']" + 
				savedObjectIds['actions']['Light levels have dropped. Turn on supplemental lighting.'])
			console.log("savedObjectIds['actions']['Light levels above recommendations. Turn off any supplemental lights.']" + 
				savedObjectIds['actions']['Light levels above recommendations. Turn off any supplemental lights.'])
		    
		    var dataObj = new models.idealRange({
				name: _data.name,
				sensor: savedObjectIds['lights']['fluorescent'],
				valueRange: _data.valueRange,
				applicableTimeSpan: _data.applicableTimeSpan,
				actionBelowMin : savedObjectIds['actions']['Light levels have dropped. Turn on supplemental lighting.'],
				actionAboveMax : savedObjectIds['actions']['Light levels above recommendations. Turn off any supplemental lights.']
			});
			dataObj.save(function (err, doc) {
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
		      if (!err) {
		        console.log("created idealRange");
		        savedObjectIds[dataType][_data.name] = doc.id;
		      } else {
		        console.log(err);
		      }

		    });
		});
	*/
    }
]);
