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
 *   3. db_init [local|dev|staging|mongodb://whatever-db-you-need] [clear]
 *   
 *   example: 
 *		db_init local
 *   example with clear:
 *		db_init dev clear
 *  
 *	 This script optionally removes all collections, then adds data from /bitponics/utils/db_init/seed_data/.
 *
 */

//TODO: separate device script
//TODO: user, phase, growPlan and growPlanInstance seed data

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
		lights: {},
		growSystems: {},
		controls: {},
		actions: {},
		idealRanges: {},
		phases: {},
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
//console.log(data);

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
					if (!mongoose.connection.collections['lights']){ return innerCallback();}
					mongoose.connection.collections['lights'].drop( function(err) {
					    if (err){ return innerCallback(err);}
					    console.log('lights collection dropped');
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
					if (!mongoose.connection.collections['idealranges']){ return innerCallback();}
					mongoose.connection.collections['idealranges'].drop( function(err) {
					    if (err){ return innerCallback(err);}
					    console.log('idealranges collection dropped');
					    innerCallback();
					});
				},
				function(innerCallback){
					if (!mongoose.connection.collections['phases']){ return innerCallback();}
					mongoose.connection.collections['phases'].drop( function(err) {
					    if (err){ return innerCallback(err);}
					    console.log('phases collection dropped');
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
		}else{
			callback(null,null);
		}
	},
    function(callback){
        /**
		 * Users
		 */
	
		var dataType = 'users',
			dataCount = data[dataType].length;

		console.log('####### ' + dataType + ' #######');

		data[dataType].forEach(function(_data){

     		models.user.createUserWithPassword({
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
			  if (!err) {
				savedObjectIds[dataType][_data.email] = user.id;
			    if (dataCount === 1) {
			      callback(null, null);
			    }
			    dataCount--;
				console.log("created user");
		      } else {
		        console.log(err);
		      }

			});

		});
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
				unit: _data.unit,
				code: _data.code,
				visible : _data.visible
			});
			
			dataObj.save(function (err, doc) {
		      savedObjectIds[dataType][_data.code] = doc.id;
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
		      if (!err) {
		        console.log("created sensor");
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
		      savedObjectIds[dataType][_data.name] = doc.id;
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
		      if (!err) {
		        console.log("created controls");
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
		      savedObjectIds[dataType][_data.name] = doc.id;
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
		      if (!err) {
		        console.log("created sensor");
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
		
			_data.sensorMap.forEach(function(s){
				s.sensor = eval(s.sensor);
			});

			console.dir(_data.sensorMap);

		    var dataObj = new models.deviceType({
				name: _data.name,
				firmwareVersion: _data.firmwareVersion,
				microprocessor: _data.microprocessor,
				sensorMap: _data.sensorMap
			});

			dataObj.save(function (err, doc) {
		      savedObjectIds[dataType][_data.name] = doc.id;
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
		      if (!err) {
		        console.log("created: " + dataType);
		      } else {
		        console.log(err);
		      }

		    });
		    
		});
    },
    function(callback){
        /**
		 * Devices
		 */
		var dataType = 'devices',
			dataCount = data[dataType].length;

		console.log('####### ' + dataType + ' #######');

		data[dataType].forEach(function(_data){
			
			//first, for each type of sensor in sensorMap, get ObjectId
			models.sensor.find(function (err, sensors) {

				_data.users.forEach(function(u,index){
					_data.users[index] = eval(u);
				});

				if(_data.sensorMap){
					_data.sensorMap.forEach(function(s){
						s.sensor = eval(s.sensor);
					});
				}

				_data.controlMap.forEach(function(c){
					c.control = eval(c.control);
				});

				/*
				_data.recentSensorLogs.forEach(function(rsl){
					rsl.logs.forEach(function(sl){
						sl.sensor = eval(sl.sensor);
					});
				});
				*/

			    var dataObj = new models.device({
					deviceId: _data.deviceId,
					deviceType: eval(_data.deviceType),
					name : _data.name,
					owner: eval(_data.owner),
					users : _data.users,
					sensorMap : _data.sensorMap,
					controlMap : _data.controlMap,
					recentSensorLogs: _data.recentSensorLogs,
					activeGrowPlanInstance : eval(_data.activeGrowPlanInstance)
				});

			    console.dir(_data)
			    console.dir(dataObj)
				
				dataObj.save(function (err, doc) {
				  if (!err) {
			        console.log("created: " + dataType);
			      } else {
			      	console.dir(dataObj)
			      	console.log("err:");
			        console.log(err);
			      }

			      savedObjectIds[dataType][_data.deviceId] = doc.id;
			      if (dataCount === 1) {
			      	 callback(null, null);
			      }
			      dataCount--;
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
		      savedObjectIds[dataType][_data.name] = doc.id;
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
		      if (!err) {
		        console.log("created light");
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
		      savedObjectIds[dataType][_data.name] = doc.id;
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
		      if (!err) {
		        console.log("created grow system");
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
		console.log(_data.description)
			var dataObj = new models.action({
				description: _data.description,
				control: eval(_data.control),
				cycle: _data.cycle
			});
			dataObj.save(function (err, doc) {
  			  if (!err) {
		      	console.log(dataCount);
		        console.log("created action");
		      } else {
		        console.log(err);
		      }

		      savedObjectIds[dataType][_data.description] = doc.id;

		      if (dataCount === 1) {
		      	callback(null, null);
		      }
		      
		      dataCount--;
		      
		    });
		});
    },
    function(callback){
        /**
		 * idealRanges
		 */
	
		var dataType = 'idealRanges',
			dataCount = data[dataType].length;

		console.log('####### ' + dataType + ' #######');

		data[dataType].forEach(function(_data){

		    var dataObj = new models.idealRange({
				name: _data.name,
				sCode: _data.sCode,
				valueRange: _data.valueRange,
				applicableTimeSpan: _data.applicableTimeSpan,
				actionBelowMin : eval(_data.actionBelowMin),
				actionAboveMax : eval(_data.actionAboveMax)
			});

			dataObj.save(function (err, doc) {
		      if (!err) {
		        console.log("created idealRange");
		      } else {
		        console.log(err);
		      }

		      savedObjectIds[dataType][_data.name] = doc.id;
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
		      

		    });
		});
    },
    function(callback){
        /**
		 * Phases
		 */
	
		var dataType = 'phases',
			dataCount = data[dataType].length;

		console.log('####### ' + dataType + ' #######');

		data[dataType].forEach(function(_data){
			var actions = [], idealRanges = [];
			_data.actions.forEach(function(action){
				actions.push(eval(action));
			})
			_data.idealRanges.forEach(function(idealRange){
				idealRanges.push(eval(idealRange));
			})

		    var dataObj = new models.phase({
				name: _data.name,
				expectedNumberOfDays: _data.expectedNumberOfDays,
				light: eval(_data.light),
				actions: actions,
				idealRanges: idealRanges
			});

			dataObj.save(function (err, doc) {
			  if (!err) {
		        console.log("created phase");
		      } else {
		        console.log(err);
		      }

		      savedObjectIds[dataType][_data.name] = doc.id;
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
		      

		    });
		});
    },
    function(callback){
        /**
		 * Grow Plans
		 */
	
		var dataType = 'growPlans',
			dataCount = data[dataType].length;

		console.log('####### ' + dataType + ' #######');

		data[dataType].forEach(function(_data){

		    var dataObj = new models.growPlan({
				createdBy: eval(_data.createdBy),
				name: _data.name,
				description: _data.description,
				plants: _data.plants,
				expertiseLevel: _data.expertiseLevel,
				growSystem: eval(_data.growSystem),
				growMedium: _data.growMedium,
				nutrients: _data.nutrients.map(function(item){ return eval(item) }),
				sensors: _data.sensors.map(function(item){ return eval(item) }),
				controls: _data.controls.map(function(item){ return eval(item) }),
				phases: _data.phases.map(function(item){ return eval(item) })
			});

		    console.log(dataObj);

			dataObj.save(function (err, doc) {
			  if (!err) {
		        console.log("created phase");
		      } else {
		        console.log(err);
		      }
		      savedObjectIds[dataType][_data.name] = doc.id;
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
		      

		    });
		});
    },
    function(callback){
        /**
		 * Grow Plan Instances
		 */
	
		var dataType = 'growPlanInstances',
			dataCount = data[dataType].length;

		console.log('####### ' + dataType + ' #######');

		data[dataType].forEach(function(_data){

			_data.phases.forEach(function(item){
				item.phase = eval(item.phase);
			});
			_data.recentSensorLogs.forEach(function(item){
				item.logs.forEach(function(log){
					log.sensor = eval(log.sensor);
				});
				
			});
			_data.controlLogs.forEach(function(item){
				item.logs.forEach(function(log){
					log.control = eval(log.control);	
				});
			});

			//console.log(savedObjectIds);
			console.log('device ' + _data.device + ' ' + eval(_data.device));

		    var dataObj = new models.growPlanInstance({
		    	gpid: _data.gpid,
				users: _data.users.map(function(item){ return eval(item) }),
				owner : eval(_data.owner),
				growPlan: eval(_data.growPlan),
				device: eval(_data.device),
				startDate: _data.startDate,
				endDate: _data.endDate,
			    active: _data.active,
				phases: _data.phases,
				recentSensorLogs: _data.recentSensorLogs,
				controlLogs: _data.controlLogs,
				photoLogs: _data.photLogs,
				genericLogs: _data.genericLogs
			});

		    console.log(dataObj);

			dataObj.save(function (err, doc) {
			  if (!err) {
		        console.log("created grow plan instance");
		      } else {
		        console.log(err);
		      }
		      savedObjectIds[dataType][_data.gpid] = doc.id;

		      if (dataObj.active){
		      	console.log('pairing grow plan instance with device');
				models.utils.activateGrowPlanInstance(doc, function(err){
					if (err) { console.log(err); }
					if (dataCount === 1) {
				      	 callback(null, null);
				      }
				      dataCount--;		
				});		      
		      } else {
		      	if (dataCount === 1) {
			      	 callback(null, null);
			      }
			      dataCount--;		
		      }
		      
			});
		});
    },
    function(callback){
        /**
		 * Sensor Logs
		 */
	
		var dataType = 'sensorLogs',
			dataCount = data[dataType].length;

		console.log('####### ' + dataType + ' #######');

		data[dataType].forEach(function(_data){
			
		    var dataObj = new models.sensorLog({
		    	gpi: eval(_data.gpi),
				timestamp : _data.timestamp,
				logs : _data.logs
			});

		    console.log(dataObj);

			dataObj.save(function (err, doc) {
			  if (!err) {
		        console.log("created sensor log");
		      } else {
		        console.log(err);
		      }
		      savedObjectIds[dataType][doc.id] = doc.id;
		      if (dataCount === 1) {
		      	 callback(null, null);
		      }
		      dataCount--;
		      
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
