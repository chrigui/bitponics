var mongoose = require('mongoose'),
    DeviceModel = require('../../models/device').model,
    GrowPlanInstanceModel = require('../../models/growPlanInstance').model,
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    winston = require('winston');
    
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
   *          sensor: "503a79426d25620000000001",
   *          value: 25,
   *          //timestamp: new Date().getTime()
   *        },
   *        {
   *          sensor: "503a79426d25620000000001",
   *          value: 24,
   *          //timestamp: new Date().getTime()
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
    var sensorLogs = req.body.sensorLogs,
        csvLogs = "";

    winston.info('req.body', req.body);
    winston.info('info', req.body);

    //if csv format, convert to js obj
    if(req.headers['content-type'] === 'text/csv'){
      winston.info('req.rawBody', req.rawBody);
      sensorLogs = [];
      csvLogs = req.rawBody.split(';');
      csvLogs.forEach(function(log){
        winston.info('log: ');
        if(log.length > 0){
          sensorLogs.push({
            'sensor': log.split(',')[0],
            'value': log.split(',')[1]
            //'timestamp': new Date()
          });
        }
      });
    }

    //get device by mac address id
    return DeviceModel.findOne({ device: req.params.id }, function(err, device) {
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
   */
  app.get('/api/devices/:id/get_current_cycles', function (req, res, next){
    //var format =  req. 'deviceCSV' : 'json';
  
    winston.info(req);  
    
    delete req.session.cookie;
    req.session.destroy();

    res.status(200);
    
    //{outputId},{startTimeOffsetInMilliseconds},{value},{durationInMilliseconds},{value},{durationInMilliseconds}
    // 16 hours = 57600000ms
    res.header('Content-Type', 'text/csv; format=device');
    //res.header('X-Powered-By', '');
    //res.header('Set-Cookie', '');


  // To end response for the firmware, send the Bell character
  res.send('1,0,1,57600000,0,28800000;2,0,1,14400000,0,7200000;' + String.fromCharCode(7));  




  /*
    res.header('Transfer-Encoding', 'chunked');
    res.header('Connection', 'keep-alive');
    
    var countdown = 10;

    var write = function(){
      res.write('1,0,1,57600000,0,28800000');  
      countdown--;
      if (!countdown){
        res.end();
      } else {
        setTimeout(write, 200);
      }
    };

    write();
    */
    /*
    return GrowPlanInstanceModel.findById(req.params.id, function (err, device) {
      if (!err) {
        //return res.send(device);
      } else {
        return console.log(err);
      }
      */
  });  

};
