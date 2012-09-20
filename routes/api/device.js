var mongoose = require('mongoose'),
    DeviceModel = require('../../models/device').model,
    GrowPlanInstanceModel = require('../../models/growPlanInstance').model,
    GrowPlanModel = require('../../models/growPlan').model,
    PhaseModel = require('../../models/phase').model,
    ActionModel = require('../../models/action').model,
    SensorModel = require('../../models/sensor').model,
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    winston = require('winston'),
    async = require('async');
    
/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List devices
  app.get('/api/devices', function (req, res, next){
    return DeviceModel.find(function (err, devices) {
      if (err) { return next(err); }
      return res.send(devices);
    });
  });

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
   *    "controlMap": [{ 
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
  app.post('/api/devices', function (req, res, next){
    var device;
    winston.info("POST: ");
    winston.info(req.body);
    device = new DeviceModel({
      id: req.body.id,
      name: req.body.name,
      deviceType: req.body.deviceType,
      owner: req.body.owner,
      users : req.body.users,
      sensors : req.body.sensors,
      controlMap : req.body.controlMap
    });
    device.save(function (err) {
      if (err) { return next(err); }
      winston.info("created device");
      return res.send(device);
    });
    
  });

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
  app.get('/api/devices/:id', function (req, res, next){
    return DeviceModel.findOne({ deviceId: req.params.id }, function (err, device) {
      if (err) { return next(err); }
      return res.send(device);
    });
  });

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
  app.put('/api/devices/:id', function (req, res, next){
    return DeviceModel.findOne({ deviceId: req.params.id }, function (err, device) {
      if (err) { return next(err); }
      device.title = req.body.title;
      return device.save(function (err) {
        if (err) { return next(err); }
        winston.info("updated device");
        return res.send(device);
      });
    });
  });

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
  app.delete('/api/devices/:id', function (req, res, next){
    return DeviceModel.findOne({ deviceId: req.params.id }, function (err, device) {
      if (err) { return next(err); }
      return device.remove(function (err) {
        if (err) { return next(err); }  
        winston.info("removed");
        return res.send('');
      });
    });
  });

  /*
   * Sensor Logs -> route to current grow plan instance for this device
   * - id is mac address of device
   * - devices will send csv for now in a form something like (TBD):
   *   sensor_id,value;sensor_id,value;sensor_id,value;sensor_id,value;
   *
   *
   */
  app.put('/api/devices/:id/sensor_logs', function (req, res, next){
    var deviceId = req.params.id.replace(/:/g,''),
        pendingSensorLog = {timestamp : Date.now(), logs : []},
        pendingDeviceLogs,
        sensors,
        device,
        growPlanInstance;

    winston.info('req.body', req.body);
    winston.info('info', req.body);

    // For now, only accept requests that use the device content-type
    if(req.headers['content-type'].indexOf('application/vnd.bitponics') == -1){
      return next(new Error('Invalid Content-Type'));
    }

    if(req.headers['content-type'].indexOf('application/vnd.bitponics') > -1){
      winston.info('req.rawBody', req.rawBody);
      pendingDeviceLogs = JSON.parse(req.rawBody);
      winston.info('JSON.parse req.rawBody ', pendingDeviceLogs);
    }

    async.waterfall([
      function wf1(wf1Callback){
        // In parallel, get the Device and all Sensors
        async.parallel([
            function parallel1(callback){
              SensorModel.find().exec(callback);
            },
            function parallel2(callback){
              DeviceModel.findOne({ deviceId: deviceId }, callback);
            }
          ],
          // When those parallel ops are done, create the sensorLog entry and also retrieve 
          // the active GrowPlanInstance
          function parallelFinal(err, results){
            if (err) { return callback(err);}
            winston.info('wf1 final step');

            sensors = results[0];
            device = results[1];
            if (!device){ 
              wf1Callback(new Error('Attempted to log to a nonexistent device'));
            }

            Object.keys(pendingDeviceLogs).forEach(function(key){
              var sensor = sensors.filter(function(s){ return s.code === key; })[0];
              if (sensor){
                pendingSensorLog.logs.push({
                  sensor : sensor._id,
                  value : pendingDeviceLogs[key]
                });
              }              
            })
            winston.info('pendingSensorLog');
            winston.info(pendingSensorLog);            

            GrowPlanInstanceModel.findOne({ device: device._id, active: true },  wf1Callback);        
          }
        );
      },
      function wf2(growPlanInstance, wf2Callback){
        // Now. In parallel, we can persist the pendingSensorLog to 
        // the device & the growPlanInstance
        async.parallel([
            function parallel1(callback){
              device.recentSensorLogs = device.recentSensorLogs || [];
              device.recentSensorLogs.push(pendingSensorLog);
              device.save(callback);
            },
            function parallel2(callback){
              growPlanInstance.sensorLogs = growPlanInstance.sensorLogs || [];
              growPlanInstance.sensorLogs.push(pendingSensorLog);          
              growPlanInstance.save(callback);
            }
          ], 
          function parallelFinal(err, result){
            if (err) { return next(err); }
            var responseBody = 'success';
            res.status(200);
            res.header('X-Bpn-ResourceName', 'sensor_logs');
            res.header('Content-Type', 'application/vnd.bitponics.v1.deviceText');
            // To end response for the firmware, send the Bell character
            responseBody += String.fromCharCode(7);
            res.send(responseBody);              
          }
        );

      }],
      function(err, result){
        if (err) { return next(err); }
      }
    );
  });


  /*
   * Get the current cycle data for the device. 
   * Pulls from the active GrowPlanInstance that's paired with the device.
   *
   * For now, only responds with device CSV. 
   */
  app.get('/api/devices/:id/cycles', function (req, res, next){
    var deviceId = req.params.id.replace(/:/g,''),
        device,
        growPlanInstance,
        growPlanInstancePhase,
        phase,
        actions; 

    winston.info(JSON.stringify(req.headers));  
    
    req.session.destroy();
    res.clearCookie('connect.sid', { path: '/' }); 
    
    //get device by mac address id. 
    //get the active GPI that's using the device.
    //get the active phase of the GPI.
    //get the actions/cycles of the phase.

    async.waterfall([
      function (callback){
        DeviceModel.findOne({ deviceId: deviceId }, callback);  
      },
      function (deviceResult, callback){
        if (!deviceResult){ 
          return callback(new Error('No device found for id ' + req.params.id));
        }
        device = deviceResult;
        GrowPlanInstanceModel.findOne({ device : deviceResult._id, active : true }).exec(callback);
      },
      function (growPlanInstanceResult, callback) {
        if (!growPlanInstanceResult){ 
          return callback(new Error('No active grow plan instance found for device'));
        }
        growPlanInstance = growPlanInstanceResult;
        growPlanInstancePhase = growPlanInstance.phases.filter(function(item){ return item.active === true; })[0];
        
        if (!growPlanInstancePhase){
          return callback(new Error('No active phase found for this grow plan instance.'));
        }
        PhaseModel.findById(growPlanInstancePhase.phase).populate('actions').exec(callback);
      },
      function (phaseResult, callback){
        winston.info('in callback 4');
        var responseBody = '';

        phase = phaseResult;
        // get the actions that have a control reference & a cycle definition
        actions = phase.actions || [];
        actions = actions.filter(function(action){ return !!action.control && !!action.cycle; });
   
        // get the device's controlMap. Use this as the outer
        // loop to get the actions the device can handle
        async.forEachSeries(device.controlMap, 
          function(controlOutputPair, iteratorCallback){
            winston.info(actions, controlOutputPair);
            
            var controlAction = actions.filter(function(action){ return action.control.equals(controlOutputPair.control);})[0];
            
            winston.info('controlAction');
            winston.info(controlAction);
            
            if (!controlAction){ return iteratorCallback(); }

            //{outputId},{startTimeOffsetInMilliseconds},{value},{durationInMilliseconds},{value},{durationInMilliseconds}        
            // TODO: startTimeOffsetInMilliseconds should be made relative to the phase start datetime (which, in turn, should have been started according to the user's locale)
            // startTimeOffsetInMilliseconds could be negative, in the example of a 16 hour light cycle. it would be 6 off, 16 on, 2 off. 1st and 3rd get concated together, but with a neg startOffset to pull the start time back to 6am
            // TODO : account for cycle.repeat

            responseBody += controlOutputPair.outputId + ',' + // outputId
                        '0,';

            controlAction.getStatesInDeviceFormat(function(err, result){
              if (err) { return next(err);}
              responseBody += result + ';';
              iteratorCallback();
            });
            
          },
          function(err){ 
            if (err) {return next(err)};
            callback(null, responseBody);    
          }
        );
      }
    ],
    function (err, responseBody) {
      if (err) { return next(err);}

      var now = Date.now();

      res.status(200);
      res.header('X-Bpn-ResourceName', 'cycles');
      res.header('Content-Type', 'application/vnd.bitponics.v1.deviceText');
      // To end response for the firmware, send the Bell character
      responseBody += String.fromCharCode(7);

      device.activeGrowPlanInstance = growPlanInstance;
      device.activePhase = phase;
      device.activeActions = {
        actions: actions,
        deviceMessage : responseBody,
        lastSent : now,
        deviceRefreshRequired : false
      };
      // Expires at the expected end of the current phase.
      // now + (total expected phase time - elapsed phase time)
      if (phase.expectedNumberOfDays){
        device.activeActions.expires = 
          now + 
          (
            (phase.expectedNumberOfDays * 24 * 60 * 60 * 1000) -
            (now - growPlanInstancePhase.startDate)
          );
      } else {
        // If phase.expectedNumberOfDays is undefined, means the phase is infinite.
        // Make the device check back in in a year anyway.
        device.activeActions.expires = now + (365*24*60*60*1000);
      }
      
      // We don't need to make the response wait for this particular save. 
      device.save();

      res.send(responseBody);
    });

  });  

  
  /*
   * Get the current refresh status for the device. Response indicates whether 
   * the device should refresh its current cycles & whether there are any control overrides
   * 
   */
  app.get('/api/devices/:id/refresh_status', function (req, res, next){
    var deviceId = req.params.id.replace(/:/g,''),
        device,
        growPlanInstance,
        growPlanInstancePhase,
        phase,
        responseTemplate = ""; 

    winston.info(req);  
    
    req.session.destroy();
    res.clearCookie('connect.sid', { path: '/' }); 
    
    async.waterfall(
      [
        function (callback){
          DeviceModel.findOne({ deviceId: deviceId }, callback);  
        },
        function (deviceResult, callback){
          if (!deviceResult){ 
            return callback(new Error('No device found for id ' + req.params.id));
          }
          device = deviceResult;
          GrowPlanInstanceModel.findOne({ device : deviceResult._id, active : true }).exec(callback);
        },
        function (growPlanInstanceResult, callback){
          if (!growPlanInstanceResult){ 
            return callback(new Error('No active grow plan instance found for device'));
          }
          growPlanInstance = growPlanInstanceResult;
          callback();
        }
      ],
      function(err, responseBody){
        if (err) { return next(err);}

        var now = Date.now();

        res.status(200);
        res.header('X-Bpn-ResourceName', 'refresh_status');
        res.header('Content-Type', 'application/vnd.bitponics.v1.deviceText');
        // To end response for the firmware, send the Bell character
        responseBody += String.fromCharCode(7);

        res.send(responseBody);
      }
    );
  });
};