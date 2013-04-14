var GrowPlanInstanceModel = require('../../models/growPlanInstance').model,
    ActionModel = require('../../models/action').model,
    DeviceModel = require('../../models/device').model,
    SensorLogModel = require('../../models/sensorLog').model,
    moment = require('moment'),
    ModelUtils = require('../../models/utils'),
    winston = require('winston'),
    async = require('async'),
    routeUtils = require('../route-utils'),
    requirejs = require('../../lib/requirejs-wrapper'),
  	feBeUtils = requirejs('fe-be-utils');

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

  /**
   *
   * @param {ObjectId} req.query.owner
   */
  app.get('/api/grow-plan-instances', 
  	routeUtils.middleware.ensureLoggedIn,
  	function (req, res, next){
	    var query = GrowPlanInstanceModel.find();

	    if (req.user.admin){

	    } else {
	    	query.or([{ visibility: feBeUtils.VISIBILITY_OPTIONS.PUBLIC }, { owner: req.user._id }]);	
	    }
	    
	    query.exec(function (err, growPlanInstances) {
	      if (err) { return next(err); }
	      return res.send(growPlanInstances);
	    });
	  }
  );

  /*
   * Create single growPlanInstance
   *
   *  Test with:
   *  jQuery.post("/api/grow-plan-instances", {
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
  app.post('/api/grow-plan-instances', 
  	routeUtils.middleware.ensureLoggedIn,
  	function (req, res, next){
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
	  }
  );


  /*
   * Read a growPlanInstance
   *
   * To test:
   * jQuery.get("/api/grow-plan-instances/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/grow-plan-instances/:id', 
  	routeUtils.middleware.ensureLoggedIn,
  	function (req, res, next){
	    return GrowPlanInstanceModel.findById(req.params.id, function (err, growPlanInstance) {
	      if (err) { return next(err); }
	      if ( (growPlanInstance.visibility === feBeUtils.VISIBILITY_OPTIONS.PRIVATE) && 
	      	   !growPlanInstance.owner.equals(req.user._id)
	      	){
	      	return res.send(401);
	      }
	      return res.send(growPlanInstance);
	    });
	  }
  );

  /*
   * Update a growPlanInstance
   *
   * jQuery.ajax({
   *     url: "/api/grow-plan-instances/503a86812e57c70000000001",
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
  app.put('/api/grow-plan-instances/:id', function (req, res, next){
    return GrowPlanInstanceModel.findById(req.params.id, function (err, growPlanInstance) {
      if (!growPlanInstance.owner.equals(req.user._id)){
      	return res.send(401, "Only grow plan instance owner may modify a grow plan instance.");
      }

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
   *     url: "/api/grow-plan-instances/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/grow-plan-instances/:id',
		routeUtils.middleware.ensureSecure, 
		routeUtils.middleware.ensureUserIsAdmin,
		function (req, res, next){
    
    return GrowPlanInstanceModel.findById(req.params.id, function (err, growPlanInstance) {
      if (err) { return next(err); }

      if (!growPlanInstance.owner.equals(req.user._id)){
      	return res.send(401, "Only grow plan instance owner may modify a grow plan instance.");
      }

      return growPlanInstance.remove(function (err) {
        if (err) { return next(err); }
        return res.send('');
      });
    });
  });


  /*
   * Sensor Logs nested resource
   * 
   * @param {Date=} req.params.start-date (optional)
   * @param {Date=} req.params.end-date (optional)
   * @param {string} req.params.sCode (optional)
   * @param {Number} req.params.limit
   *
   * Response:
   * @param {Array[SensorLog]} data
   * @param {Number} count
   */
  app.get('/api/grow-plan-instances/:id/sensor-logs', function (req, res, next){
    var response = {};

    console.log('req.params.id', req.params.id);
    return GrowPlanInstanceModel.findById(req.params.id, function (err, growPlanInstance) {
      if (err) { return next(err); }
      
      if ( (growPlanInstance.visibility === feBeUtils.VISIBILITY_OPTIONS.PRIVATE) && 
      	   !growPlanInstance.owner.equals(req.user._id)
      	){
      	return res.send(401, "The grow plan instance is private and only the owner may access its data.");
      }

      var startDate = req.param('start-date'),
      		endDate = req.param('end-date'),
      		limit = req.param('limit') || 200,
      		skip = req.param('skip'),
      		sCode = req.param('sCode'),
      		query = SensorLogModel.find({ gpi : growPlanInstance._id });

    	query.sort('-ts');
    	query.select('ts l'); // don't need to get the gpi in this query. already know it!

    	if (startDate){
    		startDate = moment(startDate).toDate();
    		query.where('ts').gt(startDate);
    	}
    	if (endDate){
    		endDate = moment(endDate).toDate();
    		query.where('ts').lt(endDate);
    	}
    	if (sCode){
    		query.where('l.s').equals(sCode);
    	}

    	query.count(function(err, count){
    		if (err) { return next(err); }

    		query.limit(limit);
    		if (skip){
    			query.skip(skip);
    		}

    		query.find().exec(function(err, sensorLogResults){
    			if (err) { return next(err);}

    			response.data = sensorLogResults;//sensorLogResults.map(function(sensorLog){ return sensorLog.toObject(); });
    			response.count = count;
    			response.limit = limit;
    			response.skip = skip;

    			return res.send(200, response);
    		});
    	});
    });
  });
  
 
  /*
   * Add an entry to actionLogs nested resource.
   *
   * @param {ObjectId|string} actionId
   * @param {string=} message (optional)
   *
   * jQuery.post("/api/grow-plan-instances/505d551472b1680000000069/immediate-action", 
   * { 
   *   actionId: "505d551372b1680000000059",
   *   message: "Manually triggered from web dashboard"
   * }, 
   * function (data, textStatus, jqXHR) {
   *   console.log("Post response:"); console.dir(data); console.log(textStatus);                                        
   * });
   */
  app.post('/api/grow-plan-instances/:id/immediate-action', function (req, res, next){
    GrowPlanInstanceModel
    .findById(req.params.id)
    .populate('device')
    .exec(function (err, growPlanInstance) {
      if (err) { return next(err); }
      if (!growPlanInstance){ return next(new Error('Invalid grow plan instance id'));}
      
      if ( !growPlanInstance.owner.equals(req.user._id)){
      	return res.send(401, "Only the grow plan instance owner may modify a grow plan instance.");
      }

    
      ModelUtils.triggerImmediateAction(
        {
          growPlanInstance : growPlanInstance, 
          device : growPlanInstance.device, 
          actionId : req.body.actionId, 
          immediateActionMessage : req.body.message,
          user : req.user
        },
        function(err){
          if (err) { return next(err); }
          return res.send('success');
        }
      );
    });
  });
};
