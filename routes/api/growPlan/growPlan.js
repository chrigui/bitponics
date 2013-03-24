var GrowPlanModel = require('../../../models/growPlan').growPlan.model,
    ActionModel = require('../../../models/action').model,
    UserModel = require('../../../models/user').model,
    LightFixtureModel = require('../../../models/lightFixture').model,
    LightBulbModel = require('../../../models/lightBulb').model,
    winston = require('winston'),
    allPurposeGrowPlanId = '506de30c8eebf7524342cb70',
    async = require('async');

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
            'name': 1,
            //description: 1,
            'phases.expectedNumberOfDays': 1,
            'createdBy': 1
          }
        ).exec(function (err, grow_plans) {
          if (err) { return next(err); }
          
          var userIds = [],
              gpObjects = [],
              overallTimeSpan = 0;

          grow_plans.forEach(function(gp){
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

      return GrowPlanModel
        .findById(id)
        .populate('controls')
        .populate('sensors')
        .populate('plants')
        .populate('phases.nutrients')
        .populate('phases.actions')
        .populate('phases.growSystem')
        .populate('phases.phaseEndActions')
        // .populate('phases.light')
        .exec(function(err, grow_plan){
          if (err) { return next(err); }

          //Populate idealRange actions ids for querying
          var actionIds = [],
            fixtureIds = [],
            bulbIds = [];

          grow_plan.phases.forEach(function(phase) {
            phase.idealRanges.forEach(function(idealRange, i) {
              actionIds.push(idealRange.actionAboveMax, idealRange.actionBelowMin);
            });
            fixtureIds.push(phase.light.fixture);
            bulbIds.push(phase.light.bulb);
          });

          async.parallel(
            [
              function parallel1(callback){
                //Query on all action ids
                ActionModel.find({})
                  .where('_id').in(actionIds)
                  .exec(callback);
              }
              // ,
              // function parallel2(callback){
              //   //query on all fixture ids
              //   LightFixtureModel.find({})
              //     .where('_id').in(fixtureIds)
              //     .exec(callback);
              // },
              // function parallel3(callback){
              //   //query on all bulb ids
              //   LightBulbModel.find({})
              //     .where('_id').in(bulbIds)
              //     .exec(callback);
              // }
            ],
            function parallelFinal(err, result){
              if (err) { return next(err); }
              var actions = result[0],
                fixtures = result[1],
                bulbs = result[2],
                growPlan = grow_plan.toObject(); //in order to have properties update as expected
              
              //manually "populate" our nested phase props
              growPlan.phases.forEach(function(phase) {
                var light = phase.light;
                if(fixtures)
                  light.fixture = fixtures.filter(function(fixture){ return fixture._id.toString() == phase.light.fixture.toString() })[0];
                if(bulbs)
                  light.bulb = bulbs.filter(function(bulb){ return bulb._id.toString() == phase.light.bulb.toString() })[0];
                phase.light = light;

                phase.idealRanges.forEach(function(idealRange) {
                  idealRange.actionAboveMax = actions.filter(function(action){ return action._id.toString() == idealRange.actionAboveMax })[0];
                  idealRange.actionBelowMin = actions.filter(function(action){ return action._id.toString() == idealRange.actionBelowMin })[0];
                });

              });

              return res.send(growPlan);

            }
          );

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
