var GrowPlanInstanceModel = require('../../models/growPlanInstance').model,
    ActionModel = require('../../models/action').model,
    DeviceModel = require('../../models/device').model,
    ActionOverrideLogModel = require('../../models/actionOverrideLog').model,
    ActionUtils = require('../../models/action').utils,
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
      actionId
   }

   jQuery.post("/api/grow_plan_instances/505d551472b1680000000069/action_override_logs", 
    { 
      actionId: "505d551372b1680000000059"
    }, 
    function (data, textStatus, jqXHR) {
      console.log("Post resposne:"); console.dir(data); console.log(textStatus);                                        
    });
   */
  app.post('/api/grow_plan_instances/:id/action_override_logs', function (req, res, next){
    return GrowPlanInstanceModel
    .findById(req.params.id)
    .populate('device')
    .exec(function (err, growPlanInstance) {
      if (err) { return next(err); }
      if (!growPlanInstance){ return next(new Error('Invalid grow plan instance id'));}
      
      ActionModel.findById(req.body.actionId, function(err, action){
        if (err) { return next(err);}
        if (!action) { return next(new Error('Invalid action id'));}

        // calculate when the actionOverride should expire.
        
        var now = new Date(),
            expires = now + (365 * 24 * 60 * 60 * 1000);
    

        async.series([
            function(callback){
              if (!action.control){ return callback(); }

              // get any other actions that exist for the same control.
              var growPlanInstancePhase = growPlanInstance.phases.filter(function(phase) { return phase.active;})[0];
              
              var activeActions = ActionModel.findOne()
                .where('_id')
                .in(growPlanInstance.device.activeActions.actions)
                .where('control')
                .equals(action.control)
                .exec(function(err, actionResult){
                  if (err) { return callback(err);}
                  if (!actionResult){ return callback(); }
                  var cycleRemainder = ActionUtils.getCycleRemainder(growPlanInstancePhase, actionResult, req.user.timezone);      
                  expires = now.valueOf() + cycleRemainder;
                  return callback();  
                });
            }
          ],
          function(err, result){
            if (err) { return next(err); }
            var actionLog = new ActionOverrideLogModel({
              gpi : growPlanInstance._id,
              timeRequested : (req.body.timeRequested ? new Date(req.body.timeRequested) : Date.now()),
              action : action,
              expires : expires
            });
            
            // push the log to ActionOverrideLogModel
            actionLog.save(function(err){
              if (err){ return next(err); }
              if (growPlanInstance.device){
                growPlanInstance.device.refreshActiveActionsOverride(function(err){
                  if (err) { return next(err); }
                  return res.send('success');
                });
              }
            });
          });
        
        
        

        /*
        //growPlanInstance.actionLogs.push(actionLog);
        growPlanInstance.save(function(err){
          if (err) { return next(err);}

          // HACK : instead of figuring out how to properly remove
          // actions from the override list, 
          growPlanInstance.device.activeActionOverrides.actions = [action];
          // rules for removing actions from override list:
          // 1. remove if its control value conflicts with the most recently pushed action
          
          // HACK: Another hack. We should actually set the expires to a future date,
          // whenever the next overrideAction should expire.
          // But instead we're going to take advantage of /device/id/cycles refresh_status
          // logic of regenerating .deviceMessage string if expires is expired
          growPlanInstance.device.activeActionOverrides.expires = Date.now() - 1000;
          growPlanInstance.device.save(function(err){
            if (err) { return next(err);}
            return res.send('success');
          });
        });

        */
      });
    });
  });
};
