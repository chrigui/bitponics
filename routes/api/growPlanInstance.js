var GrowPlanInstanceModel = require('../../models/growPlanInstance').model,
    ActionModel = require('../../models/action').model,
    DeviceModel = require('../../models/device').model,
    ActionOverrideLogModel = require('../../models/actionOverrideLog').model,
    ActionUtils = require('../../models/action').utils,
    ModelUtils = require('../../models/utils'),
    winston = require('winston'),
    async = require('async');

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List grow_plan_instance
  app.get('/api/grow_plan_instances', function (req, res, next){
    return GrowPlanInstanceModel.find(function (err, growPlanInstances) {
      if (err) { return next(err); }
      return res.send(growPlanInstances);
    });
  });

  /*
   * Create single growPlanInstance
   *
   *  Test with:
   *  jQuery.post("/api/grow_plan_instances", {
   *    users : [{ type: ObjectId, ref: 'User'}],
   *    growPlan : { type : ObjectId, ref : 'GrowPlan', required: true},
   *    device : { type : ObjectId, ref : 'Device', required: false },
   *    startDate: { type: Date, required: true },
   *    phases: [{
   *      phase: { type: ObjectId, ref: 'Phase' },
   *      startDate: { type: Date },
   *      endDate: { type: Date },
   *      active: { type: Boolean }
   *    }]
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/grow_plan_instances', function (req, res, next){
    var growPlanInstance;
    winston.info("POST: ");
    winston.info(req.body);
    growPlanInstance = new GrowPlanInstanceModel({
      users : req.body.users,
      growPlan : req.body.growPlan,
      device : req.body.device,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      active: req.body.active,
      phases: req.body.phases,
      recentSensorLogs: req.body.recentSensorLogs,
      controlLogs: req.body.controlLogs,
      photoLogs: req.body.photoLogs,
      genericLogs: req.body.genericLogs
    });
    growPlanInstance.save(function (err) {
      if (err) { return next(err); }
      return res.send(growPlanInstance);
    });
  });

  /*
   * Read an growPlanInstance
   *
   * To test:
   * jQuery.get("/api/grow_plan_instances/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/grow_plan_instances/:id', function (req, res, next){
    return GrowPlanInstanceModel.findById(req.params.id, function (err, growPlanInstance) {
      if (err) { return next(err); }
      return res.send(growPlanInstance);
    });
  });

  /*
   * Update a growPlanInstance
   *
   * jQuery.ajax({
   *     url: "/api/grow_plan_instances/503a86812e57c70000000001",
   *     type: "PUT",
   *     data: {
   *       "device": "503a86812e57c70000000001"
   *     },
   *     success: function (data, textStatus, jqXHR) {
   *         console.log("Post response:");
   *         console.dir(data);
   *         console.log(textStatus);
   *         console.dir(jqXHR);
   *     }
   * });
   */
  app.put('/api/grow_plan_instances/:id', function (req, res, next){
    return GrowPlanInstanceModel.findById(req.params.id, function (err, growPlanInstance) {
      if(req.body.users){ growPlanInstance.users = req.body.users; }
      if(req.body.device){ growPlanInstance.device = req.body.device; }
      if(req.body.startDate){ growPlanInstance.startDate = req.body.startDate; }
      if(req.body.endDate){ growPlanInstance.endDate = req.body.endDate; }
      if(req.body.active){ growPlanInstance.active = req.body.active; }
      if(req.body.phases){ growPlanInstance.phases = req.body.phases; }
      
      return growPlanInstance.save(function (err) {
        if (err) { return next(err); }
        return res.send(growPlanInstance);
      });
    });
  });


/*
   * Delete a growPlanInstance
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/grow_plan_instances/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/grow_plan_instances/:id', function (req, res, next){
    return GrowPlanInstanceModel.findById(req.params.id, function (err, growPlanInstance) {
      if (err) { return next(err); }
      return growPlanInstance.remove(function (err) {
        if (err) { return next(err); }
        return res.send('');
      });
    });
  });


  /*
   * Recent Sensor Logs nested resource
   */
  app.get('/api/grow_plan_instances/:id/recent_sensor_logs', function (req, res, next){
    return GrowPlanInstanceModel.findById(req.params.id, function (err, growPlanInstance) {
      if (err) { return next(err); }
      return res.send(growPlanInstance.recentSensorLogs);
    });
  });
  
 
  /*
   * Add an entry to actionLogs nested resource.
   *
   * params:
   * data: {
      timeRequested (optional)
      actionId,
      message (optional)
   }

   jQuery.post("/api/grow_plan_instances/505d551472b1680000000069/action_override_logs", 
    { 
      actionId: "505d551372b1680000000059",
      message: "Manually triggered from web dashboard"
    }, 
    function (data, textStatus, jqXHR) {
      console.log("Post response:"); console.dir(data); console.log(textStatus);                                        
    });
   */
  app.post('/api/grow_plan_instances/:id/action_override_logs', function (req, res, next){
    GrowPlanInstanceModel
    .findById(req.params.id)
    .populate('device')
    .exec(function (err, growPlanInstance) {
      if (err) { return next(err); }
      if (!growPlanInstance){ return next(new Error('Invalid grow plan instance id'));}
    
      ModelUtils.triggerActionOverride(
        growPlanInstance, 
        growPlanInstance.device, 
        req.body.actionId, 
        req.body.message,
        req.user.timezone,
        function(err){
          if (err) { return next(err); }
          return res.send('success');
        }
      );
    });
  });
};
