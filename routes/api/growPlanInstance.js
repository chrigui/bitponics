var GrowPlanInstanceModel = require('../../models/growPlanInstance').model,
    ActionModel = require('../../models/action').model,
    DeviceModel = require('../../models/device').model,
    SensorLogModel = require('../../models/sensorLog').model,
    NotificationModel = require('../../models/notification').model,
    ImmediateActionModel = require('../../models/immediateAction').model,
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


  /**
   * Create single growPlanInstance
   *
   *  Test with:
   *  jQuery.post("/api/grow-plan-instances", {
   *    users : [{ type: ObjectId, ref: 'User'}],
   *    growPlan : { type : ObjectId, ref : 'GrowPlan', required: true},
   *    device : { type : String , ref : 'Device', required: false },
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
	      images: req.body.images,
	      genericLogs: req.body.genericLogs
	    });
	    growPlanInstance.save(function (err) {
	      if (err) { return next(err); }
	      return res.send(growPlanInstance);
	    });
	  }
  );


  /**
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
	      if (!routeUtils.checkResourceReadAccess(growPlanInstance, req.user)){
          return res.send(401, "The grow plan instance is private and only the owner may access its data.");
        }

	      return res.send(growPlanInstance);
	    });
	  }
  );


  /**
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
      
      if (!routeUtils.checkResourceModifyAccess(growPlanInstance, req.user)){
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


  /**
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

      if (!routeUtils.checkResourceModifyAccess(growPlanInstance, req.user)){
      	return res.send(401, "Only grow plan instance owner may modify a grow plan instance.");
      }

      return growPlanInstance.remove(function (err) {
        if (err) { return next(err); }
        return res.send('');
      });
    });
  });


  /**
   * Sensor Logs nested resource
   * 
   * @param {Date=} req.params.start-date (optional) Should be something parse-able by moment.js
   * @param {Date=} req.params.end-date (optional) Should be something parse-able by moment.js
   * @param {string} req.params.sCode (optional)
   * @param {Number} req.params.limit
   *
   * Response:
   * @param {Array[SensorLog]} data
   * @param {Number} count
   */
  app.get('/api/grow-plan-instances/:id/sensor-logs', function (req, res, next){
    var response = {};

    GrowPlanInstanceModel.findById(req.params.id)
    .select('owner users visibility')
    .exec(function (err, growPlanInstance) {
      if (err) { return next(err); }
      
      if (!routeUtils.checkResourceReadAccess(growPlanInstance, req.user)){
      	return res.send(401, "The grow plan instance is private and only the owner may access its data.");
      }

      var startDate = req.query['start-date'],
      		endDate = req.query['end-date'],
      		limit = req.query['limit'] || 200,
      		skip = req.query['skip'],
      		sCode = req.query['sCode'],
      		query = SensorLogModel.find({ gpi : growPlanInstance._id });

      // cap the limit at 200
      if (limit > 200) { limit = 200; }

    	query.sort('-ts');
    	query.select('ts l'); // don't need to get the gpi in this query. already know it!

    	// TODO : Localize start/end date based on owner's timezone?
      if (startDate){
    		startDate = moment(startDate).toDate();
    		query.where('ts').gte(startDate);
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

    			return routeUtils.sendJSONResponse(res, 200, response);
    		});
    	});
    });
  });
  

  /**
   * Add a sensor log to the GPI
   *
   * @param {SensorLog} req.body.sensorLog
   */
  app.post('/api/grow-plan-instances/:id/sensor-logs', function (req, res, next){
    var response = {
      status : undefined
    };

    if (!req.body.sensorLog){
      response = {
        status : "error",
        message : "empty sensor log"
      };
      res.send(400, response);
    }

    GrowPlanInstanceModel.findById(req.params.id)
    //.populate('device')
    .exec(function (err, growPlanInstance) {
      if (err) { return next(err); }
      if (!growPlanInstance){ return next(new Error('Invalid grow plan instance id'));}
      
      if (!routeUtils.checkResourceModifyAccess(growPlanInstance, req.user)){
        return res.send(401, "Only the grow plan instance owner may modify a grow plan instance.");
      }

      ModelUtils.logSensorLog(
        {
          pendingSensorLog : req.body.sensorLog, 
          growPlanInstance : growPlanInstance, 
          user : req.user 
        },
        function(err){
          if (err) { return next(err); }
          return res.send({ status : "success" });
        }
      );
    });
  });

 
  /**
   * Add an ImmediateAction to the GPI
   * 
   * Posting to this results in a triggering of the immediate action.
   *
   * Only GPI owners or Bitponics admins can request this.
   * 
   * @param {ObjectIdString} req.body.actionId
   * @param {String=} req.body.message : optional. Message to include with the immediateAction log.
   */
  app.post('/api/grow-plan-instances/:id/immediate-actions', function (req, res, next){
    winston.info("POST /grow-plan-instances/:id/immediate-actions, gpi " + 
          req.params.id + ", action " + req.body.actionId);

    GrowPlanInstanceModel
    .findById(req.params.id)
    .populate('device')
    .populate('growPlan')
    .exec(function (err, growPlanInstance) {
      winston.info("POST /grow-plan-instances/:id/immediate-actions, returned GPI.find(), gpi " + 
          req.params.id + ", action " + req.body.actionId + ", err: " + (err ? err.toString() : '') + 
          " growplanresult:" + (growPlanInstance ? growPlanInstance._id : ''));
      
      if (err) { 
        winston.info("POST /grow-plan-instances/:id/immediate-actions, error 1");
        return next(err); }
      if (!growPlanInstance){ 
        winston.info("POST /grow-plan-instances/:id/immediate-actions, error 2")
        return next(new Error('Invalid grow plan instance id'));
      }
      
      winston.info("POST /grow-plan-instances/:id/immediate-actions, have a grow plan, gpi " + 
          growPlanInstance._id + ", action " + req.body.actionId + ", err: " + (err ? err.toString() : '') + 
          " growplanresult:" + (growPlanInstance ? growPlanInstance._id : ''));

      if (!routeUtils.checkResourceModifyAccess(growPlanInstance, req.user)){
        winston.info("POST /grow-plan-instances/:id/immediate-actions, not allowed, gpi " + 
          growPlanInstance._id + ", action " + req.body.actionId + ", err: " + (err ? err.toString() : '') + 
          " growplanresult:" + (growPlanInstance ? growPlanInstance._id : ''));

      	return res.send(401, "Only the grow plan instance owner may modify a grow plan instance.");
      }

      winston.info("POST /grow-plan-instances/:id/immediate-actions, allowed, gpi " + 
          growPlanInstance._id + ", action " + req.body.actionId + ", err: " + (err ? err.toString() : '') + 
          " growplanresult:" + (growPlanInstance ? growPlanInstance._id : ''));

      var device = growPlanInstance.device,
          now = new Date();

      if (req.query.expire === 'true'){
        console.log("GOT REQUEST TO EXPIRE ACTION " + req.body.actionId)



        var growPlanInstancePhase = growPlanInstance.phases.filter(function(phase){ return phase.active;})[0];

        if (!growPlanInstancePhase){
          return res.send(400, "Request requires an active phase on the garden.");
        }

        var growPlanPhase = growPlanInstance.growPlan.phases.filter(function(phase){ return phase._id.equals(growPlanInstancePhase.phase);})[0];


        ActionModel.find()
        .where('_id')
        .in(growPlanPhase.actions)
        .exec(function(err, growPlanPhaseActions){
          var actionsWithDeviceControl = growPlanPhaseActions.filter(
            function(item){ 
              return (item.control && device.outputMap.some(function(controlPair){ return item.control.equals(controlPair.control);})); 
            }
          );

          // TODO : DRY this up...duplicate code from GPI.activatePhase
          async.series([
            // Expire immediateActions that conflict with a device controlled action in the new phase
            function expireImmediateAction(innerParallelCallback){
              
              ImmediateActionModel
              .find()
              .where('gpi')
              .equals(growPlanInstance._id)
              .where('e')
              .gt(now)
              .where('a') // the clause added on top of gpi.activatePhase implementation
              .equals(req.body.actionId) // the clause added on top of gpi.activatePhase implementation
              .populate('a')
              .exec(function(err, immediateActionResults){
                if (err) { return innerParallelCallback(err);}
                if (!immediateActionResults.length){ return innerParallelCallback(); }
              
                var immediateActionsToExpire = [];
                immediateActionResults.forEach(function(immediateAction){
                  if (!immediateAction.action.control) { return; } 
                  if (actionsWithDeviceControl.some(function(action){
                    return immediateAction.action.control.equals(action.control);
                  })){
                    immediateActionsToExpire.push(immediateAction);
                  } 
                });

                async.forEach(immediateActionsToExpire, 
                  function(immediateAction, iteratorCallback){
                    immediateAction.expires = now;
                    immediateAction.save(iteratorCallback);
                  }, 
                  function(err){
                    if (err) { return innerParallelCallback(err);}
                    return innerParallelCallback();
                  }
                );
              });
            },
            // Force refresh of device status on next request
            function updateDeviceStatus(innerParallelCallback){
              if (!growPlanInstance.device){ return innerParallelCallback(); }
              
              growPlanInstance.device.refreshStatus(innerParallelCallback);

            }
          ],
          function(err){
            if (err) { return next(err); }
            return res.send('success');
          })
        });

        
      } else {
        winston.info("POST /grow-plan-instances/:id/immediate-actions, triggeringImmediateAction, gpi " + 
          growPlanInstance._id + ", device " + growPlanInstance.device._id + ", action " + req.body.actionId);
        ModelUtils.triggerImmediateAction(
          {
            growPlanInstance : growPlanInstance, 
            device : growPlanInstance.device, 
            actionId : req.body.actionId, 
            immediateActionMessage : req.body.message,
            user : req.user
          },
          function(err){
            if (err) { 
              winston.error("POST /grow-plan-instances/:id/immediate-actions, err:" + err.toString());
              return next(err); 
            }
            return res.send('success');
          }
        );  
      }
    });
  });


  /**
   * Retrieve ImmediateActions that have been triggered on a GPI
   *
   */
  app.get('/api/grow-plan-instances/:id/immediate-actions', function (req, res, next){
    GrowPlanInstanceModel
    .findById(req.params.id)
    .select('owner users visibility')
    .exec(function (err, growPlanInstance) {
      if (err) { return next(err); }
      if (!growPlanInstance){ return next(new Error('Invalid grow plan instance id'));}
      
      if (!routeUtils.checkResourceReadAccess(growPlanInstance, req.user)){
          return res.send(401, "Only the grow plan instance owner may modify a grow plan instance.");
      }

      ImmediateActionModel.find({gpi : growPlanInstance._id})
      .exec(function(err, immediateActionResults){
        if (err) { return next(err); }
        return res.send({
          data : immediateActionResults
        });
      });
    });
  });


  /**
   * Retrieve Notifications on a GPI
   *
   * By default, only returns active Notifications
   *
   */
  app.get('/api/grow-plan-instances/:id/notifications', function (req, res, next){
    GrowPlanInstanceModel
    .findById(req.params.id)
    .select('owner users visibility')
    .exec(function (err, growPlanInstance) {
      if (err) { return next(err); }
      if (!growPlanInstance){ return next(new Error('Invalid grow plan instance id'));}
      
      if (!routeUtils.checkResourceReadAccess(growPlanInstance, req.user)){
          return res.send(401, "Only the grow plan instance owner may modify a grow plan instance.");
      }

      NotificationModel.find(
        {
          gpi : growPlanInstance._id,
          tts : { $ne : null }
        }
      ).exec(function(err, notificationResults){
        if (err) { return next(err); }
        return routeUtils.sendJSONResponse(
          res,
          200, 
          {
            data : notificationResults
          }
        );
      });
    });
  });  
};
