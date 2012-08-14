var SensorModel = require('../models/sensor').model;

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List sensors
  app.get('/api/sensors', function (req, res){
    return SensorModel.find(function (err, sensors) {
      if (!err) {
        return res.send(sensors);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Create single sensor
   *
   *  Test with:
   *  jQuery.post("/api/sensors", {
   *    "name": "humidity",
   *    "unitOfMeasurement": "unit"
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/sensors', function (req, res){
    var sensor;
    console.log("POST: ");
    console.log(req.body);
    sensor = new SensorModel({
      name: req.body.type,
      unitOfMeasurement: req.body.unitOfMeasurement
    });
    sensor.save(function (err) {
      if (!err) {
        return console.log("created sensor");
      } else {
        return console.log(err);
      }
    });
    return res.send(sensor);
  });

  /*
   * Read an sensor
   *
   * To test:
   * jQuery.get("/api/sensors/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/sensors/:id', function (req, res){
    return SensorModel.findById(req.params.id, function (err, sensor) {
      if (!err) {
        return res.send(sensor);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Update an sensor
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/sensor/${id}",
   *     type: "PUT",
   *     data: {
   *       "actionBelowMin": "actionid"
   *     },
   *     success: function (data, textStatus, jqXHR) {
   *         console.log("Post response:");
   *         console.dir(data);
   *         console.log(textStatus);
   *         console.dir(jqXHR);
   *     }
   * });
   */
  app.put('/api/sensors/:id', function (req, res){
    return SensorModel.findById(req.params.id, function (err, sensor) {
      sensor.actionBelowMin = req.body.actionBelowMin;
      return sensor.save(function (err) {
        if (!err) {
          console.log("updated sensor");
        } else {
          console.log(err);
        }
        return res.send(sensor);
      });
    });
  });

  /*
   * Delete an sensor
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/sensors/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/sensors/:id', function (req, res){
    return SensorModel.findById(req.params.id, function (err, sensor) {
      return sensor.remove(function (err) {
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
