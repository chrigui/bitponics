var DeviceModel = require('../../models/device').model,
  ControlModel = require('../../models/control').model,
  GrowPlanInstanceModel = require('../../models/growPlanInstance').model,
  routeUtils = require('../route-utils'),
  async = require('async'),
  winston = require('winston');


module.exports = function(app){
  app.get('/account/devices',
    routeUtils.middleware.ensureSecure,
    routeUtils.middleware.ensureLoggedIn,
    function (req, res, next){
      var locals = {
        title : 'Devices',
        className : 'account-devices'
      };

      async.parallel(
        [
          function(innerCallback){
            DeviceModel.find({ owner : req.user._id })
            .populate('activeGrowPlanInstance')
            .populate('controlMap.control')
            .exec(function(err, deviceResults){
              if (err) { return innerCallback(err); }
              locals.userOwnedDevices = deviceResults;
              return innerCallback();
            });
          }
        ],
        function(err, results){

          res.render('account/devices', locals);
        }
      );
    }
  );

  app.get('/account/devices/calibrate/:id',
    routeUtils.middleware.ensureSecure,
    routeUtils.middleware.ensureLoggedIn,
    function (req, res, next){
      var locals = {
        title : 'Calibrate Sensors',
        classname : 'calibrate'
      };

      DeviceModel.find({ _id : req.param('id') })
      .populate('activeGrowPlanInstance')
      .populate('controlMap.control')
      .exec(function(err, deviceResults){
        if (err) { return next(err); }
        locals.device = deviceResults[0];
        res.render('account/calibrate', locals);
      });
    }
  );
};