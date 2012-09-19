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
   * Read an device
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
   * Update an device
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
   * Delete an device
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
   *   jQuery.ajax({
   *      url: "/api/devices/${id}/sensor_logs",
   *      type: "PUT",
   *      data: {
   *        sensorLogs: [{
   *          sensorCode: "air",
   *          value: 25
   *        },
   *        {
   *          sensorCode: "ph",
   *          value: 6.2
   *        }
   *        ],
   *      },
   *      success: function (data, textStatus, jqXHR) {
   *          console.log("Post response:");
   *          console.dir(data);
   *          console.log(textStatus);
   *          console.dir(jqXHR);
   *      }
   *   });
   *
   */
  app.put('/api/devices/:id/sensor_logs', function (req, res, next){
    var deviceId = req.params.id.replace(/:/g,''),
        pendingSensorLogs = req.body.sensorLogs || [],
        deviceLogs = "",
        sensors,
        device;

    winston.info('req.body', req.body);
    winston.info('info', req.body);

    // For now, only accept requests that use the device content-type
    if(req.headers['content-type'].indexOf('application/vnd.bitponics') == -1){
      return res.send('Invalid content-type');
    }

    if(req.headers['content-type'].indexOf('format=device') > -1){
      winston.info('req.rawBody', req.rawBody);
      pendingSensorLogs = JSON.parse(req.rawBody);
      winston.info('JSON.parse raw body ', deviceLogs);
    }

    async.waterfall([
        function(wfCallback1){
          async.parallel([
            function(callback){
              SensorModel.find().exec(callback);
            },
            function(callback){
              DeviceModel.findOne({ deviceId: deviceId }, callback);
            }
          ],
          function(err, results){
            if (err) { return callback(err);}

            winston.info('wf1 final step');
            winston.info(results);

            sensors = results[0];
            device = results[1];

            if (!device){ 
              wfCallback1(new Error('attempted to log to a nonexistent device'));
            }

            wfCallback1();
          });
          
        }
        function(callback){
          DeviceModel.findOne({ deviceId: deviceId }, callback);
        },
        function(device, callback){
              

          device.recentSensorLogs = device.recentSensorLogs || [];
            sensorLogs.forEach(function(log){
              device.recentSensorLogs.push(log);
            });
            device.save(function (err) {
              if (err) winston.error(err);
            });
        }
      ],
      function(err, result){
        if (err) { return res.send(500, err.message); }
        
      });

    return DeviceModel.findOne({ deviceId: deviceId }, function(err, device) {
      if (err) { return next(err); }
      if (!device){ 
        res.send(500, 'attempted to log to a nonexistent device');
        return winston.info('attempted log to nonexistent device');
      }

      device.recentSensorLogs = device.recentSensorLogs || [];
      sensorLogs.forEach(function(log){
        device.recentSensorLogs.push(log);
      });
      device.save(function (err) {
        if (err) winston.error(err);
      });

      //get device's current grow plan and push logs to it
      return GrowPlanInstanceModel.findOne({ device: device._id, active: true }, function (err, growPlanInstance) {
        if (err) { return next(err); }
        if (!growPlanInstance){ 
          winston.info('no grow plan instance for the device ' + device._id)
          return res.send(500, 'no grow plan instance for the device ' + device._id);
        } 
        // Else we have a growPlanInstance
        else {
          sensorLogs.forEach(function(log){
            growPlanInstance.sensorLogs.push(log);
          });
          return growPlanInstance.save(function (err) {
            if (err) { return next(err); }
            return res.csv([
              ['someresponse', 'someresponse122412']
            ]);
            
          });
        }
      });
    })
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
        activePhaseMetadata; 

    winston.info(req);  
    
    delete req.session.cookie;
    req.session.destroy();

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
        activePhaseMetadata = growPlanInstance.phases.filter(function(item){ return item.active === true; })[0];
        
        if (!activePhaseMetadata){
          return callback(new Error('No active phase found for this grow plan instance.'));
        }
        PhaseModel.findById(activePhaseMetadata.phase).populate('actions').exec(callback);
      },
      function (phaseResult, callback){
        winston.info('in callback 4');
        var actions,
            responseData = '';

        // get the actions that have a control reference & a cycle definition
        actions = phaseResult.actions || [];
        actions = actions.filter(function(action){ return !!action.control && !!action.cycle; });
   
        // get the device's controlMap. Use this as the outer
        // loop to get the actions the device can handle
        async.forEachSeries(device.controlMap, 
          function(controlOutputPair, iteratorCallback){
            console.log(actions, controlOutputPair);
            var controlAction = actions.filter(function(action){ return action.control.equals(controlOutputPair.control);})[0],
                cycleStates;
            winston.info('controlAction');
            winston.info(controlAction);
            if (!controlAction){ return iteratorCallback(); }

            cycleStates = controlAction.cycle;

            //{outputId},{startTimeOffsetInMilliseconds},{value},{durationInMilliseconds},{value},{durationInMilliseconds}        
            // TODO: startTimeOffsetInMilliseconds should be made relative to the phase start datetime (which, in turn, should have been started according to the user's locale)
            // startTimeOffsetInMilliseconds could be negative, in the example of a 16 hour light cycle. it would be 6 off, 16 on, 2 off. 1st and 3rd get concated together, but with a neg startOffset to pull the start time back to 6am
            // TODO : account for cycle.repeat

            responseData += controlOutputPair.outputId + ',' + // outputId
                        '0,';

            controlAction.getStatesInDeviceFormat(function(err, result){
              if (err) { return next(err);}
              responseData += result + ';';
              iteratorCallback();
            });
            
          },
          function(err){ 
            if (err) {return next(err)};
            callback(null, responseData);    
          }
        );
      }
    ],
    function(err, responseData) {
      if (err) { return next(err);}

      res.status(200);
      res.header('Content-Type', 'text/csv; format=device');
      // To end response for the firmware, send the Bell character
      responseData += String.fromCharCode(7);
      res.send(responseData);
    });

  });  

};
