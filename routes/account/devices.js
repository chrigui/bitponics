var DeviceModel = require('../../models/device').model,
  ControlModel = require('../../models/control').model,
  GrowPlanInstanceModel = require('../../models/growPlanInstance').model,
  routeUtils = require('../route-utils'),
  async = require('async'),
  winston = require('winston');


module.exports = function(app){
  
  /**
   *
   */
  app.get('/account/devices',
    routeUtils.middleware.ensureSecure,
    routeUtils.middleware.ensureLoggedIn,
    function (req, res, next){
      var locals = {
        title : 'Devices',
        className : 'app-page account-devices',
        pageType : 'app-page',
        appUrl: app.config.appUrl
      };

      async.parallel(
        [
          function(innerCallback){
            DeviceModel
            .find({ 'users' : req.user._id })
            .populate('activeGrowPlanInstance')
            .populate('outputMap.control')
            .exec(function(err, deviceResults){
              if (err) { return innerCallback(err); }
              
              // TODO : send the user's device keys to the page too, so that the user can see them.
              
              locals.userOwnedDevices = deviceResults.map(function(device) { return device.toObject(); });

              req.user.deviceKeys.forEach(function(deviceKey){
                locals.userOwnedDevices.forEach(function(device){
                  if (device._id.toString() === deviceKey.deviceId){
                    device.combinedKey = deviceKey.combinedKey;
                    return false;
                  }
                })                  
              });
              return innerCallback();
            });
          }
        ],
        function(err, results){
          if (err) { return next(err); }
          res.render('account/devices', locals);
        }
      );
    }
  );

  
  /**
   *
   */
  app.get('/account/devices/:id/calibrate',
    routeUtils.middleware.ensureSecure,
    routeUtils.middleware.ensureLoggedIn,
    function (req, res, next){
      
      if (!req.param('id')) { return res.redirect('/account/devices'); }

      var locals = {
        title : 'Calibrate Sensors',
        className : 'app-page calibrate',
        pageType : 'app-page'
      };

      DeviceModel.find({ _id : req.param('id') })
      .populate('activeGrowPlanInstance')
      .populate('outputMap.control')
      .exec(function(err, deviceResults){
        if (err) { return next(err); }
        locals.device = deviceResults[0];
        res.render('account/calibrate', locals);
      });
    }
  );

  

  /**
   *
   */
  app.get('/account/devices/:id/calibrate/*',
    function (req, res, next){
      return res.redirect('/account/devices/calibrate/' + req.param('id'));
    }
  );



  /**
   * Modify the device.
   *
   * For now, all you can do is clear the device's calibration mode.
   *
   * @param {String|bool} req.params.clearCalibrationMode
   */
  app.post('/account/devices/:id',
    routeUtils.middleware.ensureSecure,
    routeUtils.middleware.ensureLoggedIn,
    function (req, res, next){
      var redirectToDeviceHome = function(){
        res.redirect("/account/devices");
      };

      DeviceModel.findById(req.params.id)
      .exec(function(err, deviceResult){
        if (err) { return next(err); }
        if (!deviceResult){ return redirectToDeviceHome(); }

        if (!routeUtils.checkResourceModifyAccess(deviceResult, req.user)){
          return res.send(401);
        }

        if (req.param("clearCalibrationMode")){
          deviceResult.status.calibrationMode = undefined;
          deviceResult.save(function(err){
            if (err) { return next(err); }
            return redirectToDeviceHome();
          });
        } else {
          return redirectToDeviceHome();
        }
      });
    }
  );

  /**
   * Power outlet mapping
   */
  app.get('/account/devices/:id/outlet-map',
    routeUtils.middleware.ensureSecure,
    routeUtils.middleware.ensureLoggedIn,
    function (req, res, next){
      var locals = {
        title : 'Devices - Outlet Map',
        className : 'app-page account-devices account-devices-outlet-map',
        pageType : 'app-page',
        appUrl: app.config.appUrl
      };

      async.parallel(
        [
          function(innerCallback){
            DeviceModel.findById(req.params.id)
            .populate('activeGrowPlanInstance')
            .populate('outputMap.control')
            .exec(function(err, deviceResults){
              if (err) { return innerCallback(err); }
              locals.userOwnedDevice = deviceResults;
              return innerCallback();
            });
          },
          function(innerCallback){
            ControlModel.find()
            .exec(function(err, controls){
              locals.controls = controls;
              return innerCallback();
            });
          }
        ],
        function(err, results){
          if (err) { return next(err); }
          res.render('account/outlet-map', locals);
        }
      );
    }
  );
};