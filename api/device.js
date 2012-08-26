var mongoose = require('mongoose'),
    DeviceModel = require('../models/device').model,
    GrowPlanInstanceModel = require('../models/growPlanInstance').model,
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

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
          console.log(err);
        }
        return res.send(device);
      });
    });
  });

  /*
   * Sensor Logs -> route to current grow plan instance for this device
   *
   *   jQuery.ajax({
   *      url: "/api/device/${id}/sensorlog",
   *      type: "PUT",
   *      data: {
   *        sensorLogs: [{
   *          sensor: "503a79426d25620000000001",
   *          value: 25,
   *          timestamp: new Date()
   *        },
   *        {
   *          sensor: "503a79426d25620000000001",
   *          value: 24,
   *          timestamp: new Date()
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
   *
   *  TODO: route to grow plan instance
   */
  app.put('/api/device/:id/sensorlog', function (req, res){
    //get device's current grow plan
    return GrowPlanInstanceModel.findOne({ device: req.params.id }, function (err, growPlanInstance) {
      req.body.sensorLogs.forEach(function(log){
        growPlanInstance.sensorLogs.push(log);
      });
      return growPlanInstance.save(function (err) {
        if (!err) {
          return res.csv([
            ['someresponse', 'someresponse122412']
          ]);
        } else {
          console.log(err);
        }
        //return res.send(growPlanInstance);
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
          console.log(err);
        }
      });
    });
  });
};
