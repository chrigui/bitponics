var GrowPlanModel = require('../../../models/growPlan').growPlan.model,
    ActionModel = require('../../../models/action').model,
    winston = require('winston'),
    allPurposeGrowPlanId = '506de30c8eebf7524342cb70';

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

  /*
   * List all grow plans
   *  If no params, list all in db
   *  If id param, match on grow plan and return compact data
   *  If plants and growSystem params, filter on all grow plans (except All-Purpose) and return compact data
   */
  app.get('/api/grow_plans', function (req, res, next){
    var filter = false,
        full = false,
        id = req.query.id,
        plants = req.query.plants,
        growSystem = req.query.growSystem;
    


    if(!!plants && !!growSystem && typeof plants !== 'undefined' && typeof growSystem !== 'undefined'){
      filter = true;
      plants = plants.split(',');
      growSystem = growSystem.split(',');
    }else if(!!id){
      full = true;
    }



    if(!filter && !full) { //return all grow plans
      
      return GrowPlanModel.find(function (err, grow_plans) {
        if (err) { return next(err); }
        return res.send(grow_plans);
      });

    } else if (filter) { //filter on plants and growsystem

      return GrowPlanModel
        .find(
          {
            $or: [
              { plants: { $in: plants } },
              { phases: {
                  $elemMatch: {
                    growSystem: { $in: growSystem }
                  }
                }
              }
            ],
            _id: {
              $ne: allPurposeGrowPlanId
            }
          },
          {
            name: 1,
            description: 1
          }
        ).exec(function (err, grow_plans) {
          if (err) { return next(err); }
          return res.send(grow_plans);
        });

    } else if (full) { //return single growplan with all data populated

      return GrowPlanModel
        .findById(id)
        .populate('controls')
        .populate('sensors')
        .populate('plants')
        .populate('phases.nutrients')
        .populate('phases.actions')
        .populate('phases.growSystem')
        .populate('phases.phaseEndActions')
        .exec(function(err, grow_plan){
          if (err) { return next(err); }

          //Populate idealRange actions ids for querying
          var actionIds = [];
          grow_plan.phases.forEach(function(phase) {
            phase.idealRanges.forEach(function(idealRange, i) {
              actionIds.push(idealRange.actionAboveMax, idealRange.actionBelowMin);
            });
          });

          //Query on all action ids
          ActionModel.find({})
            .where('_id').in(actionIds)
            .exec(function (err, actions) {
              if (err) { next(err); }
              var growPlan = grow_plan.toObject(); //in order to have properties update as expected
              actions.forEach(function(action) {
                growPlan.phases.forEach(function(phase) {
                  phase.idealRanges.forEach(function(idealRange) {

                    if (action._id.toString() == idealRange.actionAboveMax) {
                      idealRange.actionAboveMax = action;
                    } else if (action._id.toString() == idealRange.actionBelowMin.toString()) {
                      idealRange.actionBelowMin = action;
                    }

                  });
                });
              });

              return res.send(growPlan);
                
            });


        });
    }
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
