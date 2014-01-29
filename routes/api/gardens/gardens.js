var GrowPlanInstanceModel = require('../../../models/garden').model,
    GardenModel = GrowPlanInstanceModel,
    ActionModel = require('../../../models/action').model,
    DeviceModel = require('../../../models/device').model,
    SensorLogModel = require('../../../models/sensorLog').model,
    PhotoModel = require('../../../models/photo').model,
    TextLogModel = require('../../../models/textLog').model,
    NotificationModel = require('../../../models/notification').model,
    ImmediateActionModel = require('../../../models/immediateAction').model,
    moment = require('moment'),
    ModelUtils = require('../../../models/utils'),
    getObjectId =  ModelUtils.getObjectId,
    getDocumentIdString = ModelUtils.getDocumentIdString,
    winston = require('winston'),
    async = require('async'),
    routeUtils = require('../../route-utils'),
    requirejs = require('../../../lib/requirejs-wrapper'),
    feBeUtils = requirejs('fe-be-utils'),
    apiUtils = require('../utils');

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
  app.get('/api/gardens', 
    apiUtils.query({
      model : GardenModel,
      restrictByVisibility : true,
      defaultSort : '-updatedAt',
      dateFieldName : 'createdAt'
    })
  );

  //   routeUtils.middleware.ensureLoggedIn,
  //   function (req, res, next){
  //     var query = GrowPlanInstanceModel.find();

  //     if (req.user.admin){

  //     } else {
  //       query.or([{ visibility: feBeUtils.VISIBILITY_OPTIONS.PUBLIC }, { owner: req.user._id }]); 
  //     }
      
  //     query.exec(function (err, growPlanInstances) {
  //       if (err) { return next(err); }
  //       return res.send(growPlanInstances);
  //     });
  //   }
  // );


  /**
   * Create single growPlanInstance
   *
   *  Test with:
   *  jQuery.post("/api/gardens", {
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
  app.post('/api/gardens', 
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
        phases: req.body.phases
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
   * jQuery.get("/api/gardens/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/gardens/:id', 
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
   * Update a garden
   * All properties are optional
   * Undefined properties are left unchanged.
   * To delete a property, it should be assigned null.
   *
   * @param req.body.device {deviceId=} Pair/Unpair a device with this garden
   * @param req.body.active {bool} Activate/Deactivate this garden
   *
   * jQuery.ajax({
   *     url: "/api/gardens/503a86812e57c70000000001",
   *     type: "POST",
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
  app.post('/api/gardens/:id', function (req, res, next){
    
    GrowPlanInstanceModel.findById(req.params.id, function (err, growPlanInstance) {
      
      if (!routeUtils.checkResourceModifyAccess(growPlanInstance, req.user)){
        return res.send(401, "Only grow plan instance owner may modify a grow plan instance.");
      }

      // Handle simple top-level updates first
      // Then more complex updates after an initial save

      if (typeof req.body.name !== 'undefined'){
        growPlanInstance.name = req.body.name;
      }

      if (typeof req.body.users !== 'undefined'){
        growPlanInstance.users = req.body.users;
      }
      
      if (typeof req.body.timezone !== 'undefined'){
        growPlanInstance.timezone = req.body.timezone;
      }

      if (typeof req.body.phases !== 'undefined'){
        growPlanInstance.phases = req.body.phases;
      }

      if (typeof req.body.visibility !== 'undefined'){
        growPlanInstance.visibility = req.body.visibility;
      }

      if (typeof req.body.settings !== 'undefined'){
        growPlanInstance.settings = req.body.settings; 
      }

      return growPlanInstance.save(function (err) {
        if (err) { return next(err); }
        
        async.waterfall(
        [
          function checkDevice(innerCallback){
            if (typeof req.body.device === 'undefined'){ return innerCallback(null, growPlanInstance); }

            // check whether it's a new assignment and if so, call gpi.pairWithDevice
            if (req.body.device === null){
              return growPlanInstance.unpairDevice(innerCallback);
            } else if (getDocumentIdString(req.body.device) !== getDocumentIdString(growPlanInstance.device)){
              growPlanInstance.pairWithDevice({
                deviceId : getDocumentIdString(req.body.device),
                saveGrowPlanInstance : true
              }, function(err, pairResult){
                return innerCallback(err, pairResult.growPlanInstance);
              });
            } else {
              return innerCallback(null, growPlanInstance);
            }
          },
          function checkActive(updatedGPI, innerCallback){
            if (typeof req.body.active === 'undefined'){ return innerCallback(null, updatedGPI); }
            
            // Check whether we're changing active state
            if (req.body.active === growPlanInstance.active){ return innerCallback(null, updatedGPI); }

            // if we're here, we're changing active state
            if (req.body.active){
              growPlanInstance.activate({}, innerCallback);
            } else {
              growPlanInstance.deactivate(innerCallback);
            }
          }
        ],
        function waterfallEnd(err, finalGrowPlanInstance){
          if (err) { return next(err); }

          return res.send(finalGrowPlanInstance);  
        });
      });
    });
  });


  /**
   * Activate a new phase on a garden
   *
   * @param req.body.growPlanPhaseId {ObjectId} Phase of the garden's GrowPlan to activate
   *
   */
  app.post('/api/gardens/:id/activate-phase', function (req, res, next){

    GrowPlanInstanceModel.findById(req.params.id, function (err, growPlanInstance) {
    
      if (!routeUtils.checkResourceModifyAccess(growPlanInstance, req.user)){
        return res.send(401, "Only grow plan instance owner may modify a grow plan instance.");
      }

      growPlanInstance.activatePhase({
        phaseId : req.body.growPlanPhaseId,
        save : true
      }, function(err, updatedGrowPlanInstance){
        return res.send(updatedGrowPlanInstance);
      });
    });
  });


  /**
   * Delete a growPlanInstance
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/gardens/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/gardens/:id',
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

};
