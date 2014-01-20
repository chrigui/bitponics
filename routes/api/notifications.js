/**
 * @module routes/api/users/notifications
 */

var UserModel = require('../../models/user').model,
    NotificationModel = require('../../models/notification').model,
    moment = require('moment'),
    winston = require('winston'),
    async = require('async'),
    routeUtils = require('../route-utils'),
    requirejs = require('../../lib/requirejs-wrapper'),
    feBeUtils = requirejs('fe-be-utils'),
    apiUtils = require('./utils');

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

  app.get('/api/notifications/:id', 
    routeUtils.middleware.ensureLoggedIn,
    function (req, res, next){
      return NotificationModel.findById(req.params.id, function (err, notificationResult) {
        if (err) { return next(err); }
        if (!routeUtils.checkResourceReadAccess(notificationResult, req.user)){
          return res.send(401, "The notification may only be viewed by its users.");
        }

        return res.send(notificationResult);
      });
    }
  );

  /**
   * Mark a notification as checked.
   * 
   * No params.
   *
   */
  app.post('/api/notifications/:id/mark-as-checked',
    routeUtils.middleware.ensureLoggedIn,
    function(req, res, next){
      
      var response = {
        statusCode : 200,
        body : {}
      };

      NotificationModel.findById(req.params.id)
      .exec(function(err, notificationResult){
        if (err) { return next(err); }
        if (!notificationResult){ return routeUtils.sendJSONResponse(res, 400);  }
        
        if (!routeUtils.checkResourceModifyAccess(notificationResult, req.user)){
          response = {
            statusCode : 401,
            body : "Only notification users may modify the notification."
          };
          return routeUtils.sendJSONResponse(res, response.statusCode, response.body);
        }

        notificationResult.markAsChecked();

        notificationResult.save(function(err, updatedNotification){
          if (err) { return next(err); }
          
          response.body = updatedNotification;

          winston.info("MARKING NOTIFICATION CHECKED, id " + updatedNotification._id.toString() + ", user " + req.params.id);

          return routeUtils.sendJSONResponse(res, response.statusCode, response.body);    
        });

      });      
    }
  );
};
