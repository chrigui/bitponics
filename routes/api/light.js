var LightModel = require('../../models/light').model,
    winston = require('winston');

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List lights
  app.get('/api/lights', function (req, res, next){
    return LightModel.find(function (err, lights) {
      if (err) { return next(err); }
      return res.send(lights);
      });
  });

  /*
   * Create single light
   *
   *  Test with:
   *  jQuery.post("/api/lights", {
   *    "type": "light type",
   *    "watts": "60",
   *    "brand" : "light brand",
   *    "name" : "big"
   *    }
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/lights', function (req, res, next){
    var light;
    winston.info("POST: ");
    winston.info(req.body);
    light = new LightModel({
      type: req.body.type,
      watts: req.body.watts,
      brand : req.body.brand,
      name : req.body.name
    });
    light.save(function (err) {
      if (err) { return next(err); }
      return res.send(light);
    });
  });

  /*
   * Read an light
   *
   * To test:
   * jQuery.get("/api/lights/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/lights/:id', function (req, res, next){
    return LightModel.findById(req.params.id, function (err, light) {
      if (err) { return next(err); }
      return res.send(light);
    });
  });

  /*
   * Update a light
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/lights/${id}",
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
  app.put('/api/lights/:id', function (req, res, next){
    return LightModel.findById(req.params.id, function (err, light) {
      if (err) { return next(err); }
      light.actionBelowMin = req.body.actionBelowMin;
      return light.save(function (err) {
        if (err) { return next(err); }
        return res.send(light);
      });
    });
  });

  /*
   * Delete a light
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/lights/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/lights/:id', function (req, res, next){
    return LightModel.findById(req.params.id, function (err, light) {
      if (err) { return next(err); }
      return light.remove(function (err) {
        if (err) { return next(err); }
        return res.send('');
      });
    });
  });
};
