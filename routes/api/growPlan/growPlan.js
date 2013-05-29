var GrowPlanModel = require('../../../models/growPlan').growPlan.model,
    ActionModel = require('../../../models/action').model,
    UserModel = require('../../../models/user').model,
    LightFixtureModel = require('../../../models/lightFixture').model,
    LightBulbModel = require('../../../models/lightBulb').model,
    ModelUtils = require('../../../models/utils'),
    winston = require('winston'),
    allPurposeGrowPlanId = '506de30c8eebf7524342cb70',
    async = require('async'),
    routeUtils = require('../../route-utils');

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {
  /*
   * List all grow plans
   *  If no params, list all in db
   *  If id param, match on grow plan and return compact data
   *  If plants and growSystem params, filter on all grow plans (except All-Purpose) and return compact data
   */
  app.get('/api/grow-plans', 
  	routeUtils.middleware.ensureLoggedIn,
  	function (req, res, next){
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
      
      return GrowPlanModel.find(function (err, growPlans) {
        if (err) { return next(err); }
        return res.send(growPlans);
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
            'name': 1,
            //description: 1,
            'phases.expectedNumberOfDays': 1,
            'createdBy': 1
          }
        ).exec(function (err, growPlans) {
          if (err) { return next(err); }
          
          var userIds = [],
              gpObjects = [],
              overallTimeSpan = 0;

          growPlans.forEach(function(gp){
            var gpo = gp.toObject();
            userIds.push(gp.createdBy);
            gpo.overallTimeSpan = gpo.phases.reduce(function(prev, curr){
              var value1 = prev.expectedNumberOfDays,
                  value2 = curr.expectedNumberOfDays;
              if(typeof value1 != 'number'){ value1 = 0; }
              if(typeof value2 != 'number'){ value2 = 0; }
              return value1 + value2
            });
            console.log('gpObjects:'+gpo.overallTimeSpan);
            gpObjects.push(gpo);
            
          });
          
          UserModel.find().where('_id').in(userIds).select('name').exec(function (err, users){
            gpObjects.forEach(function(gp){
              gp.createdBy = users.filter(function(user){ 
                return user._id.toString() == gp.createdBy.toString()
              });
            });

            return res.send(gpObjects);
          });

          
        });

    } else if (full) { //return single growplan with all data populated
      ModelUtils.getFullyPopulatedGrowPlan( { _id: id }, function(err, growPlanResults){
        if (err) { return callback(err); }

        var growPlanResult = growPlanResults[0];

        if (!growPlanResult){ 
          return callback(new Error(i18nKeys.get('Invalid Grow Plan id', submittedGrowPlan._id)));
        }

        return res.send(growPlanResult);

      });
    }
  });

  /*
   * Create single grow plan
   *
   *  Test with:
   *  jQuery.post("/api/grow-plans", {
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
  app.post('/api/grow-plans', 
  	routeUtils.middleware.ensureLoggedIn,
  	function (req, res, next){
	    var grow_plan;
	    winston.info("POST: ");
	    winston.info(req.body);
	    grow_plan = new GrowPlanModel({
	      parentGrowPlanId: req.body.parentGrowPlanId,
	      createdBy: req.body.createdBy,
	      name: req.body.name,
	      description: req.body.description,
	      plants: req.body.plants,
	      phases: req.body.phases
	    });
	    grow_plan.save(function (err) {
	      if (err) { return next(err); }
	      return res.send(grow_plan);
	    });
	  }
  );



  /*
   * Read a grow plan
   *
   * To test:
   * jQuery.get("/api/grow-plans/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/grow-plans/:id', 
  	routeUtils.middleware.ensureLoggedIn,
  	function (req, res, next){
	    
	    ModelUtils.getFullyPopulatedGrowPlan( { _id: req.params.id }, function(err, growPlanResults){
        if (err) { return callback(err); }

        var growPlanResult = growPlanResults[0];

        if (!growPlanResult){ 
          return callback(new Error(i18nKeys.get('Invalid Grow Plan id', submittedGrowPlan._id)));
        }

        return res.send(growPlanResult);
      });
	  }
  );

  
  /*
   * Update a grow plan
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/grow-plans/${id}",
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
  app.put('/api/grow-plans/:id', 
  	routeUtils.middleware.ensureLoggedIn,
  	function (req, res, next){
	    return GrowPlanModel.findById(req.params.id, function (err, growPlanResult) {
	      if (err) { return next(err); }

	      
	      return growPlanResult.save(function (err, updatedGrowPlan) {
	        if (err) { return next(err); }
	        return res.send(updatedGrowPlan);
	      });
	    });
	  }
  );

  /*
   * Delete a grow plan
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/grow-plans/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/grow-plans/:id',
		routeUtils.middleware.ensureSecure, 
		routeUtils.middleware.ensureUserIsAdmin,
		function (req, res, next){
    return GrowPlanModel.findById(req.params.id, function (err, grow_plan) {
      if (err) { return next(err); }

      return grow_plan.remove(function (err) {
        if (err) { return next(err); }
        return res.send('');
      });
    });
  });

};
