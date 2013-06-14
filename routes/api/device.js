var mongoose = require('mongoose'),
    Device = require('../../models/device'),
    DeviceModel = Device.model,
    DeviceUtils = Device.utils,
    GrowPlanModel = require('../../models/growPlan').growPlan.model,
    GrowPlanInstanceModel = require('../../models/growPlanInstance').model,
    Action = require('../../models/action'),
    ActionModel = Action.model,
    SensorModel = require('../../models/sensor').model,
    SensorLogModel = require('../../models/sensorLog').model,
    ModelUtils = require('../../models/utils'),
    winston = require('winston'),
    async = require('async'),
    timezone = require('timezone/loaded'),
    routeUtils = require('../route-utils');
    
/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List devices
  app.get('/api/devices',
    routeUtils.middleware.ensureSecure,
    routeUtils.middleware.ensureUserIsAdmin,
    function (req, res, next){
      return DeviceModel.find(function (err, devices) {
        if (err) { return next(err); }
        return res.send(devices);
      });
    }
  );

  /*
   * Create single device
   *
   *  Test with:
   *  jQuery.post("/api/devices", {
   *    "id": "_id"
   *    "name": "pump",
   *    "owner": "userid",
   *    "users": ["userid", "userid1", "userid2"],
   *    "sensors": ["sensorid", "sensorid1", "sensorid2"],
   *    "outputMap": [{ 
   *        "control": "controlid",
   *        "outputId": "outlet1"
   *      },
   *      { 
   *        "control": "controlid",
   *        "outputId": "outlet2"
   *    }]
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post response:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/devices', 
    routeUtils.middleware.ensureSecure, 
    routeUtils.middleware.ensureUserIsAdmin, 
    function (req, res, next){
      var device;
      winston.info("POST: ");
      winston.info(req.body);
      device = new DeviceModel({
        id: req.body.id,
        name: req.body.name,
        deviceType: req.body.deviceType,
        owner: req.body.owner,
        users : req.body.users,
        sensorMap : req.body.sensorMap,
        outputMap : req.body.outputMap
      });
      device.save(function (err) {
        if (err) { return next(err); }
        winston.info("created device");
        return res.send(device);
      });
      
    }
  );

  /*
   * Read a device
   *
   * To test:
   * jQuery.get("/api/devices/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/devices/:id', 
    routeUtils.middleware.ensureSecure, 
    routeUtils.middleware.ensureUserIsAdmin, 
    function (req, res, next){
      return DeviceModel.findOne({ _id: req.params.id }, function (err, device) {
        if (err) { return next(err); }
        return res.send(device);
      });
    }
  );

  /*
   * Update a device
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/devices/${id}",
   *     type: "PUT",
   *     data: {
   *       "name": "updated pump"
   *     },
   *     success: function (data, textStatus, jqXHR) {
   *         console.log("Post response:");
   *         console.dir(data);
   *         console.log(textStatus);
   *         console.dir(jqXHR);
   *     }
   * });
   */
  app.put('/api/devices/:id', 
    routeUtils.middleware.ensureSecure,
    routeUtils.middleware.ensureUserIsAdmin, 
    function (req, res, next){
      return DeviceModel.findOne({ _id: req.params.id }, function (err, device) {
        if (err) { return next(err); }
        device.title = req.body.title;
        return device.save(function (err) {
          if (err) { return next(err); }
          winston.info("updated device");
          return res.send(device);
        });
      });
    }
  );

  /*
   * Delete a device
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/devices/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/devices/:id', 
    routeUtils.middleware.ensureSecure, 
    routeUtils.middleware.ensureUserIsAdmin, 
    function (req, res, next){
      return DeviceModel.findOne({ _id: req.params.id }, function (err, device) {
        if (err) { return next(err); }
        return device.remove(function (err) {
          if (err) { return next(err); }  
          winston.info("removed");
          return res.send('');
        });
      });
    }
  );

  


  /**
   * Get the current cycle data & mode for the device. 
   * Pulls from the active GrowPlanInstance that's paired with the device.
   *
   * For now, only responds with device CSV. 
   */
  app.get('/api/devices/:id/status',
    routeUtils.middleware.ensureDeviceLoggedIn,
    function (req, res, next){
      var id = req.params.id.replace(/:/g,'');
      sendDeviceStatusResponse(req, res, next, id);
    }
  );


  /**
   * Post status for this Device. sensor logs & calibration mode.
   * 
   * @param {string} req.id. mac address of device
   * @param {Object.<SensorLog>} req.body.sensors. JSON.
   * @param req.body.calib
   * @param req.body.calib.mode
   * @param req.body.calib.status
   * @param req.body.calib.message
   */
  app.post('/api/devices/:id/status',
    routeUtils.middleware.ensureDeviceLoggedIn,
    function (req, res, next){
      var id = req.params.id.replace(/:/g,''),
          reqBody = {},
          pendingSensorLog = { ts : Date.now(), logs : []},
          pendingDeviceLogs,
          calibrationStatusLog,
          device,
          growPlanInstance;

      winston.info('/status POST headers');
      winston.info(req.headers);
      winston.info('/status POST req.rawBody');
      winston.info(JSON.stringify(req.rawBody));

      // For now, only accept requests that use the device content-type
      if(req.headers['content-type'].indexOf('application/vnd.bitponics') == -1){
        return next(new Error('Invalid Content-Type'));
      }

      if(req.headers['content-type'].indexOf('application/vnd.bitponics') > -1 && req.rawBody){
        // we get req.rawBody created for all requests that come from a device
        reqBody = JSON.parse(req.rawBody);
        pendingDeviceLogs = reqBody["sensors"];
        calibrationStatusLog = reqBody["calib"];
      }

      async.waterfall(
        [
          function getDevice(callback){
            DeviceModel
            .findOne({ _id: id })
            .populate('activeGrowPlanInstance')
            .exec(function(err, device){
              if (!device){ 
                return next(new Error('Attempted to log to a nonexistent device'));
              }
              if (pendingSensorLog){
                pendingSensorLog.deviceId = id;  
              }
              return callback(err, device);
            });
          },
          function logLogs(device, callback){
            // Run in series so that we don't attempt to update an outdated device document
            async.series(
              [
                function logSensorLogs(innerCallback){
                  if (!pendingDeviceLogs){
                    return innerCallback();
                  }
                  
                  Object.keys(pendingDeviceLogs).forEach(function(key){
                    pendingSensorLog.logs.push({
                      sCode : key,
                      val : pendingDeviceLogs[key]
                    });
                  });
                  
                  winston.info('/status logSensorLogs');
                  winston.info(JSON.stringify(pendingSensorLog));

                  ModelUtils.logSensorLog(
                    {
                      pendingSensorLog : pendingSensorLog, 
                      growPlanInstance : device.activeGrowPlanInstance, 
                      device : device, 
                      user : req.user 
                    },
                    innerCallback
                  );
                },
                function logCalibrationStatusLog(innerCallback){
                  if (!calibrationStatusLog){
                    return innerCallback();
                  }
                  winston.info('/status logCalibrationStatusLog');
                  calibrationStatusLog.timestamp = calibrationStatusLog.timestamp || Date.now();

                  DeviceModel.logCalibrationStatus({
                    device : device,
                    calibrationStatusLog : calibrationStatusLog
                  },
                  innerCallback
                  );
                }
              ],
              function seriesFinal(err, results){
                winston.info('/status seriesFinal', err);
                return callback(err);
              }
            );
          }
        ],
        function waterfallFinal(err){
          winston.info('/status waterfallFinal', err);
          if (err) { return next(err); }
          winston.info('/status waterfallFinal sending device status response');
          return sendDeviceStatusResponse(req, res, next, id, device);
        }
      );
    }
  );

  
  var sendDeviceStatusResponse = function(req, res, next, id, deviceModel){
    async.waterfall([
      function getDevice(innerCallback){
        // Ensure we're working with the latest device document
        DeviceModel
        .findOne({ _id: id })
        .exec(innerCallback);
      },
      function getStatus(device, innerCallback){
        if (!device){ 
          return innerCallback(new Error('No device found for id ' + req.params.id));
        }
        var now = Date.now();

        //console.log('forceRefreshParam', req.params['forceRefresh']);
        
        if (device.status.expires > now && !req.params['forceRefresh']){
          return device.getStatusResponse(innerCallback);
        }

        device.refreshStatus(function(err, updatedDevice){
          if (err){ return innerCallback(err); }
          return updatedDevice.getStatusResponse(innerCallback);
        });
      }
    ],
    function(err, deviceStatusResponse){
      if (err) { return next(err); }

      return sendDeviceResponse({
        req : req,
        res : res,
        next : next,
        resourceName : "status",
        responseBody : deviceStatusResponse
      });
    });
  };


  /**
   *
   * @param {object} settings
   * @param {Request} settings.req : Express request object
   * @param {Response} settings.res : Express response object
   * @param {string} settings.resourceName : "refresh_status"|"cycle"|"calibration"
   * @param {string=} settings.responseBody. If set, sent and HTTP code is 200. If not set, HTTP code is 204 (no content)
   */
  var sendDeviceResponse = function(settings){
    var DEVICE_RESPONSE_END_CHAR = String.fromCharCode(7), // BELL CHAR
      req = settings.req,
      res = settings.res,
      responseBody = settings.responseBody;

    req.session.destroy();
    res.clearCookie('connect.sid', { path: '/' }); 
    res.header('X-Bpn-ResourceName', settings.resourceName);
    res.header('Content-Type', 'application/vnd.bitponics.v1.deviceText');
    res.header('Connection', 'close');

    if (responseBody){
      res.status(200);

      if (responseBody.charAt(responseBody.length - 1) !== DEVICE_RESPONSE_END_CHAR) {
        responseBody += DEVICE_RESPONSE_END_CHAR;
      }
    } else {
      // 204 No Content
      res.status(204);
    }
    
    res.send(responseBody);
  };
};