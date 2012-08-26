var DeviceModel = require('../models/device').model,
    GrowPlanInstanceModel = require('../models/growPlanInstance').model;

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List devices
  app.get('/api/device', function (req, res){
    return DeviceModel.find(function (err, devices) {
      if (!err) {
        return res.send(devices);
      } else {
        res.send(500);
        return console.log(err);
      }
    });
  });

  /*
   * Create single device
   *
   *  Test with:
   *  jQuery.post("/api/devices", {
   *    "id": "macaddress"
   *    "name": "pump",
   *    "users": ["userid", "userid1", "userid2"],
   *    "sensors": ["sensorid", "sensorid1", "sensorid2"],
   *    "controlMap": [{ 
   *        "control": "controlid",
   *        "outletId": "outlet1"
   *      },
   *      { 
   *        "control": "controlid",
   *        "outletId": "outlet2"
   *    }]
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/device', function (req, res){
    var device;
    console.log("POST: ");
    console.log(req.body);
    device = new DeviceModel({
      id: req.body.id,
      name: req.body.name,
      users : req.body.users,
      sensors : req.body.sensors,
      controlMap : req.body.controlMap,
    });
    device.save(function (err) {
      if (!err) {
        return console.log("created device");
      } else {
        res.send(500);
        return console.log(err);
      }
    });
    return res.send(device);
  });

  /*
   * Read an device
   *
   * To test:
   * jQuery.get("/api/device/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/device/:id', function (req, res){
    return DeviceModel.findById(req.params.id, function (err, device) {
      if (!err) {
        return res.send(device);
      } else {
        res.send(500);
        return console.log(err);
      }
    });
  });

  /*
   * Update an device
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/device/${id}",
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
  app.put('/api/device/:id', function (req, res){
    return DeviceModel.findById(req.params.id, function (err, device) {
      device.title = req.body.title;
      return device.save(function (err) {
        if (!err) {
          console.log("updated device");
        } else {
          res.send(500);
          console.log(err);
        }
        return res.send(device);
      });
    });
  });

  /*
   * Delete an device
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/device/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/device/:id', function (req, res){
    return DeviceModel.findById(req.params.id, function (err, device) {
      return device.remove(function (err) {
        if (!err) {
          console.log("removed");
          return res.send('');
        } else {
          res.send(500);
          console.log(err);
        }
      });
    });
  });


  /*
   * Get the current cycle data for the device. 
   * Pulls from the active GrowPlanInstance that's paired with the device.
   *
   */
  app.get('/api/device/:id/getcurrentcycles', function (req, res){
    //var format =  req. 'deviceCSV' : 'json';
  
  console.log(req);  
  
  delete req.session.cookie;
  req.session.destroy();

  res.status(200);
  
  //{outletId},{startTimeOffsetInMilliseconds},{value},{durationInMilliseconds},{value},{durationInMilliseconds}
  // 16 hours = 57600000ms
  res.header('Content-Type', 'text/csv; format=device');
  //res.header('X-Powered-By', '');
  //res.header('Set-Cookie', '');

res.write('1,0,1,57600000,0,28800000;');  

// To end response for the firmware, send the EOT (End of Transmission) character
res.write(String.fromCharCode(4)); 
res.end();

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
