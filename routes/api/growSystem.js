var GrowSystemModel = require('../../models/growSystem').model,
    winston = require('winston'),
    routeUtils = require('../route-utils');

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List grow_systems
  app.get('/api/grow_systems', function (req, res, next){
    return GrowSystemModel.find(function (err, growSystems) {
      if (err) { return next(err); }
      return res.send(growSystems);
    });
  });

  /*
   * Create single growSystem
   *
   *  Test with:
   *  jQuery.post("/api/grow_systems", {
   *    "name": "Raft System",
   *    "description": "basic raft system",
   *    "type": "aquaponics"
   *    "reservoirSize": 5,
   *    "numberOfPlants": 6
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/grow_systems', function (req, res, next){
    var growSystem;
    winston.info("POST: ");
    winston.info(req.body);
    growSystem = new GrowSystemModel({
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      reservoirSize: req.body.reservoirSize,
      numberOfPlants: req.body.numberOfPlants,
    });
    growSystem.save(function (err) {
      if (err) { return next(err); }
      return res.send(growSystem);  
    });
    
  });

  /*
   * Read an growSystem
   *
   * To test:
   * jQuery.get("/api/grow_systems/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/grow_systems/:id', function (req, res, next){
    return GrowSystemModel.findById(req.params.id, function (err, growSystem) {
      if (err) { return next(err); }
      return res.send(growSystem);
    });
  });

  /*
   * Update an growSystem
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/grow_systems/${id}",
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
  app.put('/api/grow_systems/:id', function (req, res, next){
    return GrowSystemModel.findById(req.params.id, function (err, growSystem) {
      if (err) { return next(err); }
      growSystem.description = req.body.description;
      return growSystem.save(function (err) {
        if (err) { return next(err); }
        return res.send(growSystem);
      });
    });
  });

  /*
   * Delete an growSystem
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/grow_systems/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/grow_systems/:id', function (req, res, next){
    return GrowSystemModel.findById(req.params.id, function (err, growSystem) {
      if (err) { return next(err); }
      return growSystem.remove(function (err) {
        if (err) { return next(err); }
        return res.send('');
      });
    });
  });
};
