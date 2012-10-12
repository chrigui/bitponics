var SensorModel = require('../../models/sensor').model,
    winston = require('winston');

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List sensors
  app.get('/api/sensors', function (req, res, next){
    return SensorModel.find(function (err, sensors) {
      if (err) { return next(err); }
      return res.send(sensors);
    });
  });

  /*
   * Create single sensor
   *
   *  Test with:
   *  jQuery.post("/api/sensors", {
   *    "name": "humidity",
   *    "abbrev": "hum",
   *    "unitOfMeasurement": "unit"
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/sensors', function (req, res, next){
    var sensor;
    winston.log("POST: ");
    winston.log(req.body);
    sensor = new SensorModel({
      name: req.body.name,
      abbrev: req.body.abbrev,
      unit: req.body.unit
    });
    sensor.save(function (err) {
      if (err) { return next(err); }
      winston.log("created sensor");
      return res.send(sensor);
    });
  });

  /*
   * Read a sensor
   *
   * To test:
   * jQuery.get("/api/sensors/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/sensors/:id', function (req, res, next){
    return SensorModel.findById(req.params.id, function (err, sensor) {
      if (err) { return next(err); }
      return res.send(sensor);
    });
  });

  /*
   * Update a sensor
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/sensors/${id}",
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
  app.put('/api/sensors/:id', function (req, res, next){
    return SensorModel.findById(req.params.id, function (err, sensor) {
      if (err) { return next(err); }
      sensor.actionBelowMin = req.body.actionBelowMin;
      return sensor.save(function (err) {
        if (err) { return next(err); }
        winston.log("updated sensor");
        return res.send(sensor);
      });
    });
  });

  /*
   * Delete a sensor
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
  app.delete('/api/sensors/:id', function (req, res, next){
    return SensorModel.findById(req.params.id, function (err, sensor) {
      if (err) { return next(err); }
      return sensor.remove(function (err) {
        if (err) { return next(err); }
        winston.log("removed sensor");
        return res.send('');
      });
    });
  });
};
