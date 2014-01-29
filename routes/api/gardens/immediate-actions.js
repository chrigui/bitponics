var GrowPlanInstanceModel = require('../../../models/garden').model,
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
    feBeUtils = requirejs('fe-be-utils');

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {
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
  app.post('/api/gardens/:id/immediate-actions', function (req, res, next){
    winston.info("POST /gardens/:id/immediate-actions, gpi " + 
          req.params.id + ", action " + req.body.actionId);

    GrowPlanInstanceModel
    .findById(req.params.id)
    .populate('device')
    .populate('growPlan')
    .exec(function (err, growPlanInstance) {
      if (err) { return next(err); }
      if (!growPlanInstance){ return next(new Error('Invalid grow plan instance id')); }
      
      if (!routeUtils.checkResourceModifyAccess(growPlanInstance, req.user)){
        return res.send(401, "Only the grow plan instance owner may modify a grow plan instance.");
      }

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
                  innerParallelCallback
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
      }
    });
  });


  /**
   * Retrieve ImmediateActions that have been triggered on a GPI
   *
   */
  app.get('/api/gardens/:id/immediate-actions', function (req, res, next){
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
};