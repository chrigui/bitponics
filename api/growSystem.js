var GrowSystemModel = require('../models/growSystem').model;

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List grow_systems
  app.get('/api/grow_system', function (req, res){
    return GrowSystemModel.find(function (err, growSystems) {
      if (!err) {
        return res.send(growSystems);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Create single growSystem
   *
   *  Test with:
   *  jQuery.post("/api/grow_system", {
   *    "name": "Raft System",
   *    "description": "basic raft system",
   *    "type": "aquaponics"
   *    "reservoirSize": 5,
   *    "numberOfPlants": 6
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/grow_system', function (req, res){
    var growSystem;
    console.log("POST: ");
    console.log(req.body);
    growSystem = new GrowSystemModel({
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      reservoirSize: req.body.reservoirSize,
      numberOfPlants: req.body.numberOfPlants,
    });
    growSystem.save(function (err) {
      if (!err) {
        return console.log("created growSystem");
      } else {
        return console.log(err);
      }
    });
    return res.send(growSystem);
  });

  /*
   * Read an growSystem
   *
   * To test:
   * jQuery.get("/api/grow_system/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/grow_system/:id', function (req, res){
    return GrowSystemModel.findById(req.params.id, function (err, growSystem) {
      if (!err) {
        return res.send(growSystem);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Update an growSystem
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/growSystem/${id}",
   *     type: "PUT",
   *     data: {
   *       "description": "new description"
   *     },
   *     success: function (data, textStatus, jqXHR) {
   *         console.log("Post response:");
   *         console.dir(data);
   *         console.log(textStatus);
   *         console.dir(jqXHR);
   *     }
   * });
   */
  app.put('/api/grow_system/:id', function (req, res){
    return GrowSystemModel.findById(req.params.id, function (err, growSystem) {
      growSystem.description = req.body.description;
      return growSystem.save(function (err) {
        if (!err) {
          console.log("updated growSystem");
        } else {
          console.log(err);
        }
        return res.send(growSystem);
      });
    });
  });

  /*
   * Delete an growSystem
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/grow_system/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/grow_system/:id', function (req, res){
    return GrowSystemModel.findById(req.params.id, function (err, growSystem) {
      return growSystem.remove(function (err) {
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
