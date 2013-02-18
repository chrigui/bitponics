var mongoose = require('mongoose'),
    Device = require('../models/device'),
    DeviceModel = Device.model,
    DeviceUtils = Device.utils,
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    winston = require('winston'),
    async = require('async');

module.exports = function(app){
	app.get('/setup', function (req, res){
	  var locals = {
	    title: 'Bitponics Device Setup',
	    className : 'setup'
	  };

	  res.render('setup', locals);

	});

	/**
	 * Posts to /setup should specify a device MAC address, and should
	 * be an authenenticated user. We then assign the device to the user 
	 */
	app.post('/setup', function (req, res, next){
	  	var rawDeviceMacAddress = req.param('deviceMacAddress'),
	  		deviceId,
	  		device,
	  		now = Date.now();

	  	console.log('req.params');
	  	console.log(req.params);
	  	console.log('req.body');
	  	console.log(req.body);
		console.log('req.user');
	  	console.log(req.user);
	  	

  		if (!rawDeviceMacAddress){
  			return res.json(400, { success : false, error : 'Request requires deviceMacAddress parameter'});
  		}

  		deviceId = rawDeviceMacAddress.replace(/:/g,'')

        // TODO : use some sort of "ensureAuthenticated" middleware to do this
        if (!req.user instanceof Object){
            return res.json(400, { success : false, error : 'Request requires a User instance'});
        }

		// See if the device exists.
		async.series([
			function(callback){
				DeviceModel.findOne({ deviceId: deviceId }, 
					function(err, deviceResult){
						if (err) { return callback(err);}
						if (deviceResult){
							device = deviceResult;
						} else {
							// TODO : this scenario shouldn't occur in production; we should create Device model instances
							// at production time. 
							device = new DeviceModel({
								deviceId : deviceId
		                        // will get a default deviceType based on Device middleware
							});
						}

						device.userAssignmentLogs = device.userAssignmentLogs || [];
						device.userAssignmentLogs.push({
							ts: now,
							user : req.user,
		                    assignmentType : DeviceUtils.roles.owner
						});
		                device.owner = req.user;

		                device.save(callback)
					}
				);
			}
            ],
			function(err, result){
                if (err){ return next(err); }
                return res.json(200, {success: true});
			}
		);
	});	
};