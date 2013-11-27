var GrowPlanInstanceModel = require('../../../models/growPlanInstance').model,
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
   * Retrieve Notifications on a GPI
   *
   * By default, only returns active Notifications
   *
   */
  app.get('/api/gardens/:id/notifications', function (req, res, next){
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