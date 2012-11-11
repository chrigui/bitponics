var GrowPlanModel = require('../../../models/growPlan').growPlan.model,
    winston = require('winston');

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {
  /*
   * API overview page
   */
  app.get('/api', function (req, res) {
    res.render('api', {
      title: "Bitponics API",
      appUrl : app.config.appUrl
    });
  });

   //List grow plans
  app.get('/api/grow_plans', function (req, res, next){
    return GrowPlanModel.find(function (err, grow_plans) {
      console.log(grow_plans)
      console.log(err)
      if (err) { return next(err); }
      return res.send(grow_plans);
    });
  });

  /*
   * Create single grow plan
   *
   *  Test with:
   *  jQuery.post("/api/grow_plans", {
   *    "parentGrowPlanId": "growplanid",
   *    "createdBy": "userid",
   *    "name": "Jack's Grow Plan",
   *    "description": "Herbs on a raft.",
   *    "plants": [{ name : "basil"}, { name : "rosemary"}, { name : "dill"}, { name : "swiss chard"} ],
   *    "sensors": "",
   *    "controls": "",
   *    "phases": ""
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/grow_plans', function (req, res, next){
    var grow_plan;
    winston.info("POST: ");
    winston.info(req.body);
    grow_plan = new GrowPlanModel({
      parentGrowPlanId: req.body.parentGrowPlanId,
      createdBy: req.body.createdBy,
      name: req.body.name,
      description: req.body.description,
      plants: req.body.plants,
      expertiseLevel: req.body.expertiseLevel,
      sensors: req.body.sensors,
      controls: req.body.controls,
      phases: req.body.phases
    });
    grow_plan.save(function (err) {
      if (err) { return next(err); }
      return res.send(grow_plan);
    });
  });

  /*
   * Read a grow plan
   *
   * To test:
   * jQuery.get("/api/grow_plans/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/grow_plans/:id', function (req, res, next){
    return GrowPlanModel.findById(req.params.id, function (err, grow_plan) {
      if (err) { return next(err); }
      return res.send(grow_plan);
    });
  });

  /*
   * Update a grow plan
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/grow_plans/${id}",
   *     type: "PUT",
   *     data: {
   *       "title": "New Grow Plan Title"
   *     },
   *     success: function (data, textStatus, jqXHR) {
   *         console.log("Post response:");
   *         console.dir(data);
   *         console.log(textStatus);
   *         console.dir(jqXHR);
   *     }
   * });
   */
  app.put('/api/grow_plans/:id', function (req, res, next){
    return GrowPlanModel.findById(req.params.id, function (err, grow_plan) {
      if (err) { return next(err); }

      grow_plan.title = req.body.title;
      return grow_plan.save(function (err) {
        if (err) { return next(err); }
        return res.send(grow_plan);
      });
    });
  });

  /*
   * Delete a grow plan
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/grow_plans/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/grow_plans/:id', function (req, res, next){
    return GrowPlanModel.findById(req.params.id, function (err, grow_plan) {
      if (err) { return next(err); }

      return grow_plan.remove(function (err) {
        if (err) { return next(err); }
        return res.send('');
      });
    });
  });
};
