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
    timezone = require('timezone/loaded');
    
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
      sensorMap : req.body.sensorMap,
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
    return DeviceModel.findOne({ macAddress: req.params.id }, function (err, device) {
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
    return DeviceModel.findOne({ macAddress: req.params.id }, function (err, device) {
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
    return DeviceModel.findOne({ macAddress: req.params.id }, function (err, device) {
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
            var responseBody = 'success';
            res.status(200);
            res.header('X-Bpn-ResourceName', 'sensor_logs');
            res.header('Content-Type', 'application/vnd.bitponics.v1.deviceText');
            // To end response for the firmware, send the Bell character
            responseBody += String.fromCharCode(7);
            res.send(responseBody);              
          }
        );
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
    var macAddress = req.params.id.replace(/:/g,''),
        device,
        growPlanInstance,
        growPlanInstancePhase,
        phase,
        actions,
        responseBodyTemplate = "CYCLES={cycles}" + String.fromCharCode(7),
        responseBody = responseBodyTemplate,
        cycleTemplate = DeviceUtils.cycleTemplate;

    winston.info('In /cycles');
    winston.info(JSON.stringify(req.headers));  
    
    req.session.destroy();
    res.clearCookie('connect.sid', { path: '/' }); 
    
    //get device by mac address id. 
    //get the active GPI that's using the device.
    //get the active phase of the GPI.
    //get the actions/cycles of the phase.

    async.waterfall([
      function (callback){
        DeviceModel.findOne({ macAddress: macAddress }).populate('activeGrowPlanInstance').exec(callback);  
      },
      function (deviceResult, callback){
        if (!deviceResult){ 
          return callback(new Error('No device found for id ' + req.params.id));
        }
        device = deviceResult;

        growPlanInstance = device.activeGrowPlanInstance;

        if (!growPlanInstance){ 
          return callback(new Error('No active grow plan instance found for device'));
        }
        
        growPlanInstancePhase = growPlanInstance.phases.filter(function(item){ return item.active === true; })[0];
        
        if (!growPlanInstancePhase){
          return callback(new Error('No active phase found for this grow plan instance.'));
        }

        GrowPlanModel.findById(growPlanInstance.growPlan)
        .populate('phases.actions')
        .exec(callback);
      },
      function (growPlanResult, callback){
        var allCyclesString = '';

        phase = growPlanResult.phases.filter(function(item){return item._id.equals(growPlanInstancePhase.phase);})[0];
        // get the actions that have a control reference & a cycle definition & are repeating
        actions = phase.actions || [];
        actions = actions.filter(function(action){ return !!action.control && !!action.cycle && !!action.cycle.repeat; });
   
        // get the device's controlMap. Use this as the outer
        // loop to get the actions the device can handle
        device.controlMap.forEach(
          function(controlOutputPair){
            var thisCycleString = cycleTemplate.replace('{outputId}',controlOutputPair.outputId),
                controlAction = actions.filter(function(action){ return action.control.equals(controlOutputPair.control);})[0],
                now = new Date();
            
            winston.info('controlAction');
            winston.info(controlAction);
            
            // Need an entry for every control, even if there's no associated cycle
            if (!controlAction){ 
              // if no action, just 0 everything out
              thisCycleString = thisCycleString.replace('{override}','0');
              thisCycleString = thisCycleString.replace('{offset}','0');
              thisCycleString = thisCycleString.replace('{value1}','0');    
              thisCycleString = thisCycleString.replace('{duration1}','0');    
              thisCycleString = thisCycleString.replace('{value2}','0');    
              thisCycleString = thisCycleString.replace('{duration2}','0');     
            } else {
              thisCycleString = thisCycleString.replace('{override}','1');
              
              var cycleRemainder = ActionModel.getCycleRemainder(now, growPlanInstancePhase, controlAction, req.user.timezone);
              thisCycleString = ActionModel.updateCycleTemplateWithStates(thisCycleString, controlAction.cycle.states, cycleRemainder).cycleString;
            }
            allCyclesString += thisCycleString;
          }
        );
        return callback(null, allCyclesString);
      }
    ],
    function (err, allCyclesString) {
      if (err) { return next(err);}
      
      var now = Date.now();
      
      responseBody = responseBody.replace('{cycles}', allCyclesString);

      device.activeGrowPlanInstance = growPlanInstance;
      device.activeActions = {
        actions: actions,
        deviceMessage : responseBody,
        lastSent : now,
        deviceRefreshRequired : false
      };
      // Expires at the expected end of the current phase.
      // now + (total expected phase time - elapsed phase time)
      // TODO : or...since phase transitions have to be manually approved,
      // should this just expire like 1 year into the future and get refreshed
      // on phase transitions?
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

      res.status(200);
      res.header('X-Bpn-ResourceName', 'cycles');
      res.header('Content-Type', 'application/vnd.bitponics.v1.deviceText');
      res.send(responseBody);
    });

  });  

  
  /*
   * Get the current refresh status for the device. Response indicates whether 
   * the device should refresh its current cycles & whether there are any control overrides
   * 
   * https://docs.google.com/a/bitponics.com/document/d/1YD6AFDxeuUVzQuMhvIh3W5AKRe9otmEI_scxCohP9u4/edit#
   */
  app.get('/api/devices/:id/refresh_status', function (req, res, next){
    var macAddress = req.params.id.replace(/:/g,''),
        device,
        growPlanInstance,
        growPlanInstancePhase,
        phase,
        activeImmediateActionsActions,
        cycleTemplate = DeviceUtils.cycleTemplate,
        responseBodyTemplate = "REFRESH={refresh}\nOVERRIDES={overrides}" + String.fromCharCode(7),
        responseBody = responseBodyTemplate,
        allCyclesString = '';

    req.session.destroy();
    res.clearCookie('connect.sid', { path: '/' }); 
    
    async.waterfall(
      [
        function (callback){
          DeviceModel.findOne({ macAddress: macAddress }).populate('activeImmediateActions.actions').exec(callback);  
        },
        function (deviceResult, callback){
          if (!deviceResult){ 
            return callback(new Error('No device found for id ' + req.params.id));
          }
          device = deviceResult;

          // Set whether we need to ask the device to refresh its cycles
          responseBody = responseBody.replace(/{refresh}/, device.activeActions.deviceRefreshRequired ? '1' : '0');

          if (device.activeImmediateActions.expires > Date.now()){
            return callback();
          } else {
            device.refreshActiveImmediateActions(callback);
          }
        }
      ],
      function(err){
        if (err) { return next(err);}
        
        responseBody = responseBody.replace(/{overrides}/, device.activeImmediateActions.deviceMessage);
        
        res.status(200);
        res.header('X-Bpn-ResourceName', 'refresh_status');
        res.header('Content-Type', 'application/vnd.bitponics.v1.deviceText');
        res.send(responseBody);
      }
    );
  });
};