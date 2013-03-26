var mongoose = require('mongoose'),
  Device = require('../models/device'),
  DeviceModel = Device.model,
  DeviceUtils = Device.utils,
  ModelUtils = require('../models/utils'),
  routeUtils = require('./route-utils'),
  winston = require('winston'),
  async = require('async');

module.exports = function(app){
  app.get('/setup',
    routeUtils.middleware.ensureSecure,
    routeUtils.middleware.ensureLoggedIn,
    function (req, res){
      req.user.ensureAvailableDeviceKey(function(err, availableDeviceKey){
        var locals = {
          title: 'Bitponics Device Setup',
          className : 'setup',
          availableDeviceKey : availableDeviceKey
        };

        res.render('setup', locals);
      });
    }
  );

  /**
   * Posts to /setup should specify a device MAC address, and should
   * be an authenenticated user. We then assign the device to the user
   * 
   * Required params : "deviceMacAddress", "publicDeviceKey"
   */
  app.post('/setup',
    routeUtils.middleware.ensureSecure,
    routeUtils.middleware.ensureLoggedIn,
    function (req, res, next){
      var rawDeviceMacAddress = req.param('deviceMacAddress'),
        cleanDeviceMacAddress,
        device,
        now = Date.now();

      winston.info('/setup');
      winston.info('req.params');
      winston.info(req.params);
      winston.info('req.body');
      winston.info(req.body);
      winston.info('req.user');
      winston.info(req.user);

      if (!rawDeviceMacAddress){
        return res.json(400, { success : false, error : 'Request requires deviceMacAddress parameter'});
      }
      if (!req.param('publicDeviceKey')) { return res.json(400, { success : false, error : 'Request requires publicDeviceKey parameter'});}

      cleanDeviceMacAddress = rawDeviceMacAddress.replace(/:/g,'')

      ModelUtils.assignDeviceToUser({
        deviceMacAddress : cleanDeviceMacAddress,
        publicDeviceKey : req.param('publicDeviceKey'),
        user : req.user
      }, function(err, result){
        if (err){ return next(err); }
        return res.json(200, {success: true});
      });
    }
  );
};