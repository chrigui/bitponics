var LightModel = require('../../models/light').model,
    winston = require('winston'),
    routeUtils = require('../route-utils');

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
   */
  app.post('/api/lights', function (req, res, next){
    var light;
    light = LightModel.create(req.body, function (err, lightResult) {
      if (err) { return next(err); }
      return res.send(lightResult);
    });
  });

  /*
   * Read a light
   *
   */
  app.get('/api/lights/:id', function (req, res, next){
    return LightModel.findById(req.params.id, function (err, light) {
      if (err) { return next(err); }
      return res.send(light);
    });
  });

  /*
   * Update a light
   */
  app.put('/api/lights/:id', function (req, res, next){
    return res.send('NOT IMPLEMENTED');
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
    return res.send('NOT IMPLEMENTED');
  });
};
