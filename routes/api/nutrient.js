var NutrientModel = require('../../models/nutrient').model;

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List nutrients
  app.get('/api/nutrients', function (req, res){
    return NutrientModel.find(function (err, nutrients) {
      if (!err) {
        return res.send(nutrients);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Create single nutrient
   *
   *  Test with:
   *  jQuery.post("/api/nutrients", {
   *    "brand" : "nutrient brand",
   *    "name" : "big"
   *    }
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/nutrients', function (req, res){
    var nutrient;
    console.log("POST: ");
    console.log(req.body);
    nutrient = new NutrientModel({
      brand : req.body.brand,
      name : req.body.name
    });
    nutrient.save(function (err) {
      if (!err) {
        return console.log("created nutrient");
      } else {
        return console.log(err);
      }
    });
    return res.send(nutrient);
  });

  /*
   * Read an nutrient
   *
   * To test:
   * jQuery.get("/api/nutrients/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/nutrients/:id', function (req, res){
    return NutrientModel.findById(req.params.id, function (err, nutrient) {
      if (!err) {
        return res.send(nutrient);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Update an nutrient
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/nutrients/${id}",
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
  app.put('/api/nutrients/:id', function (req, res){
    return NutrientModel.findById(req.params.id, function (err, nutrient) {
      nutrient.actionBelowMin = req.body.actionBelowMin;
      return nutrient.save(function (err) {
        if (!err) {
          console.log("updated nutrient");
        } else {
          console.log(err);
        }
        return res.send(nutrient);
      });
    });
  });

  /*
   * Delete an nutrient
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/nutrients/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/nutrients/:id', function (req, res){
    return NutrientModel.findById(req.params.id, function (err, nutrient) {
      return nutrient.remove(function (err) {
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
