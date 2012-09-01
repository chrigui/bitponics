var LightModel = require('../../models/light').model;

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List lights
  app.get('/api/light', function (req, res){
    return LightModel.find(function (err, lights) {
      if (!err) {
        return res.send(lights);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Create single light
   *
   *  Test with:
   *  jQuery.post("/api/light", {
   *    "type": "light type",
   *    "watts": "60",
   *    "brand" : "light brand",
   *    "name" : "big"
   *    }
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/light', function (req, res){
    var light;
    console.log("POST: ");
    console.log(req.body);
    light = new LightModel({
      type: req.body.type,
      watts: req.body.watts,
      brand : req.body.brand,
      name : req.body.name
    });
    light.save(function (err) {
      if (!err) {
        return console.log("created light");
      } else {
        return console.log(err);
      }
    });
    return res.send(light);
  });

  /*
   * Read an light
   *
   * To test:
   * jQuery.get("/api/light/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/light/:id', function (req, res){
    return LightModel.findById(req.params.id, function (err, light) {
      if (!err) {
        return res.send(light);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Update an light
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/light/${id}",
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
  app.put('/api/light/:id', function (req, res){
    return LightModel.findById(req.params.id, function (err, light) {
      light.actionBelowMin = req.body.actionBelowMin;
      return light.save(function (err) {
        if (!err) {
          console.log("updated light");
        } else {
          console.log(err);
        }
        return res.send(light);
      });
    });
  });

  /*
   * Delete an light
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/light/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/light/:id', function (req, res){
    return LightModel.findById(req.params.id, function (err, light) {
      return light.remove(function (err) {
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
