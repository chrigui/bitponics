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
   *    "id": "macaddress"
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
      return DeviceModel.findOne({ macAddress: req.params.id }, function (err, device) {
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
      return DeviceModel.findOne({ macAddress: req.params.id }, function (err, device) {
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
      return DeviceModel.findOne({ macAddress: req.params.id }, function (err, device) {
        if (err) { return next(err); }
        return device.remove(function (err) {
          if (err) { return next(err); }  
          winston.info("removed");
          return res.send('');
        });
      });
    }
  );

  /*
   * Log a SensorLog for this Device
   * @param {string} req.id. mac address of device
   * @param {Array.<SensorLog>} req.body. JSON.
   */
  app.put('/api/devices/:id/sensor_logs', 
    routeUtils.middleware.ensureDeviceLoggedIn,
    function (req, res, next){
      var macAddress = req.params.id.replace(/:/g,''),
          pendingSensorLog = { ts : Date.now(), logs : []},
          pendingDeviceLogs,
          sensors,
          device,
          growPlanInstance;

      winston.info('sensor_logs req.body');
      winston.info(JSON.stringify(req.body));

      // For now, only accept requests that use the device content-type
      if(req.headers['content-type'].indexOf('application/vnd.bitponics') == -1){
        return next(new Error('Invalid Content-Type'));
      }

      if(req.headers['content-type'].indexOf('application/vnd.bitponics') > -1){
        // we get req.rawBody created for all requests that come from a device
        pendingDeviceLogs = JSON.parse(req.rawBody);
      }

      // In parallel, get the Device and all Sensors
      async.parallel(
        [
          function parallel1(callback){
            SensorModel.find().exec(callback);
          },
          function parallel2(callback){
            DeviceModel
            .findOne({ macAddress: macAddress })
            .populate('activeGrowPlanInstance')
            .exec(callback);
          }
        ],
        function parallelFinal(err, results){
          if (err) { return next(err);}
        
          sensors = results[0];
          device = results[1];
          if (!device){ 
            return next(new Error('Attempted to log to a nonexistent device'));
          }

          Object.keys(pendingDeviceLogs).forEach(function(key){
            pendingSensorLog.logs.push({
              sCode : key,
              val : pendingDeviceLogs[key]
            });
          });
          
          winston.info('pendingSensorLog');
          winston.info(JSON.stringify(pendingSensorLog));

          ModelUtils.logSensorLog(
            {
              pendingSensorLog : pendingSensorLog, 
              growPlanInstance : device.activeGrowPlanInstance, 
              device : device, 
              user : req.user 
            },
            function(err){
              if (err) { return next(err); }
              
              return sendDeviceResponse({
                req : req,
                res : res,
                resourceName : "sensor_logs",
                responseBody : '{"status":"success"}'
              });
            }
          );
        }
      );
    }
  );


  /**
   * Get the current cycle data for the device. 
   * Pulls from the active GrowPlanInstance that's paired with the device.
   *
   * For now, only responds with device CSV. 
   */
  app.get('/api/devices/:id/status', 
    routeUtils.middleware.ensureDeviceLoggedIn,
    function (req, res, next){
      var macAddress = req.params.id.replace(/:/g,'');
      
      async.series([
        function (innerCallback){
          DeviceModel
          .findOne({ macAddress: macAddress })
          .exec(function(err, deviceResult){
            if (err) { return next(err); }
            if (!deviceResult){ 
              return callback(new Error('No device found for id ' + req.params.id));
            }
              
            var now = Date.now();
            if (deviceResult.status.expires > now){
              return deviceResult.getStatusResponse(innerCallback);
            }

            deviceResult.refreshStatus(function(err, updatedDevice){
             return updatedDevice.getStatusResponse(innerCallback);
           });
          });  
        }
      ],
      function(err, results){
        if (err) { return next(err); }

        var statusResponseBody = results[0];

        return sendDeviceResponse({
          req : req,
          res : res,
          resourceName : "status",
          responseBody : statusResponseBody
        });
      });
    }
  );

    
  /**
   * required request parameters:
   *
   * @param req.body.calibrationLog
   * @param req.body.calibrationLog.mode
   * @param req.body.calibrationLog.status
   * @param req.body.calibrationLog.message
   */
  app.post('/api/devices/:id/calibrate', 
    routeUtils.middleware.ensureDeviceLoggedIn,
    function (req, res, next){
      var macAddress = req.params.id.replace(/:/g,''),
          calibrationLog;

      winston.info('In /devices/:id/calibrate');
      winston.info(JSON.stringify(req.headers));  
      
      // For now, only accept requests that use the device content-type
      if(req.headers['content-type'].indexOf('application/vnd.bitponics') == -1){
        return next(new Error('Invalid Content-Type'));
      }

      if(req.headers['content-type'].indexOf('application/vnd.bitponics') > -1){
        calibrationLog = JSON.parse(req.rawBody);
      }

      calibrationLog.timestamp = calibrationLog.timestamp || Date.now();

      DeviceModel.logCalibration({
        macAddress : macAddress,
        calibrationLog : calibrationLog
      },
      function(err){
        if (err) { return next(err);}
        return sendDeviceResponse({
          req : req,
          res : res,
          resourceName : "calibrate"
        });
      });
    }
  );

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