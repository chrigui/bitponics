module.exports = {
	middleware : {
		ensureLoggedIn : function(req, res, next){
			if( !(req.user && req.user._id)){
				return res.redirect('/login?redirect=' + req.url);
			}
			next();
		},
/*
    ensureDeviceKeyVerified : function(req, res, next){
    	var async = require('async'),
    			DeviceModel = require('../models/device').model;
    	// get the key on the req.user. check whether it has a device and is verified.
    	// if not verified, use the id on the request to retrieve
    	// the device. check whether device.serial matches the serial that we have
    	// on the req.deviceKey. If so, set the device & set verified & save the user
    	var deviceKey = req.deviceKey;

    	if (!deviceKey) { return next(); }

    	if (deviceKey.deviceId && deviceKey.verified){ return next(); }
			
			var id = req.params.id.replace(/:/g,'');
    	DeviceModel
      .findOne({ _id: id })
      .exec(function(err, device){
      	if (err) { return next(err); }	
      	if (device.serial === deviceKey.serial){
      
      		var dKeys = req.user.deviceKeys,
      				dKey,
      				found = false,
      				i = dKeys.length;
    			for (; i--;){
    				dKey = dKeys[i];
    				if ((deviceKey.serial === dKey.serial) && (dKey.public === deviceKey.public)){
    					found = true;
    					break;
    				}
    			}

    			if (found){
    				ModelUtils.assignDeviceToUser({
              user : req.user,
              deviceKey : dKey,
              device : device
            },
            function(err){
              return next(err);
            });
    			} else {
    				return next(new Error("Could not verify device for the serial number " + deviceKey.serial));

    },
    */
    ensureDeviceLoggedIn : function(req, res, next){
      if( !(req.user && req.user._id)){
        var error = new Error("Invalid device request auth");
        error.status = 403; // TODO: should be a 401 but for some reason server is returning an empty response if it's a 401
        error.headers = {
          "WWW-Authenticate" : "BPN_DEVICE"
        };
        return next(error);
      }
      next();
    },
		ensureUserIsAdmin : function(req, res, next){
			if( !(req.user && req.user._id && req.user.admin)){
				return res.redirect('/login?redirect=' + req.url);
			}
			next();
		},
		/**
		 * References:
		 * http://stackoverflow.com/questions/7450940/automatic-https-connection-redirect-with-node-js-express
		 * http://stackoverflow.com/questions/13186134/node-js-express-and-heroku-how-to-handle-http-and-https
		 */
		ensureSecure : (function(){
			var app = require('../app');
			if (app.settings.env === 'local'){
				return function(req, res, next){
					if (req.secure){
						return next();
					}
					res.redirect("https://" + req.headers.host + req.url); 
				}
			} else {
				// else, assumed to be hosted on heroku
				return function(req, res, next){
					if (req.headers['x-forwarded-proto'] === 'https'){
						return next();
					}
					res.redirect("https://" + req.headers.host + req.url); 
				}
			}
		}())
	}
};