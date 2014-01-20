/**
 * @module routes/api/users/notifications
 */

var UserModel = require('../../../models/user').model,
    NotificationModel = require('../../../models/notification').model,
    moment = require('moment'),
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
   * Get user's notifications
   * By default, returns pending notifications (timeToSend is defined and is less than now)
   * 
   * Request:
   * @param {Date} [req.params.start-date] (optional) Should be something parse-able by moment.js
   * @param {Date} [req.params.end-date] (optional) Should be something parse-able by moment.js
   * @param {Number} [req.params.skip=0] - Number of results to skip (used for pagination)
   * @param {Number} [req.params.limit=200] - Number of results to return per page. Hard limit of 200.
   * @param {string=} [req.params.sort] - name of field to sort by. prefix with "-" for descending.
   * @param {CSV} [req.params.select] - CSV list of field names to include in the response. Fields on nested objects can be requested with dot-notation: "nestedDocument.name"
   * @param {Object} [req.params.where] - JSON-encoded query object. Defaults to filtering on notifications with a timeToSend in the past
   *
   * Response:
   * @param {Array[model]} data
   * @param {Number} count
   * @param {Number} skip
   * @param {Number} limit
   */
  app.get('/api/users/:id/notifications', apiUtils.query({
    parentModel : UserModel,
    parentModelFieldName : 'u',
    model : NotificationModel,
    dateFieldName : 'tts',
    defaultSort : '-tts',
    defaultWhere : function(){
      return { tts : { $lte : new Date() } };
    }
  }));



  /**
   * Mark a notification as checked.
   * 
   * No params.
   *
   */
  // app.post('/api/users/:id/notifications/:notificationId/mark-as-checked',
  //   routeUtils.middleware.ensureLoggedIn,
  //   function(req, res, next){
      
  //     var response = {
  //       statusCode : 200,
  //       body : {}
  //     };

  //     NotificationModel.findById(req.params.notificationId)
  //     .exec(function(err, notificationResult){
  //       if (err) { return next(err); }
  //       if (!notificationResult){ return routeUtils.sendJSONResponse(res, 400);  }
        
  //       if (!routeUtils.checkResourceModifyAccess(user, req.user)){
  //         response = {
  //           statusCode : 401,
  //           body : "Only the user may modify user notifications."
  //         };
  //         return routeUtils.sendJSONResponse(res, response.statusCode, response.body);
  //       }

  //       notificationResult.markAsChecked();

  //       notificationResult.save(function(err, updatedNotification){
  //         if (err) { return next(err); }
          
  //         response.body = updatedNotification;

  //         winston.info("MARKING NOTIFICATION CHECKED, id " + updatedNotification._id.toString() + ", user " + req.params.id);

  //         return routeUtils.sendJSONResponse(res, response.statusCode, response.body);    
  //       });

  //     });      
  //   }
  // );


  
  /**
   * Get user's recent notifications
   * Returns a concat'ed list of user's pending and recently-sent notifications
   * 
   *
   * Response:
   * @param {Array[model]} data
   * @param {Number} count
   * @param {Number} skip
   * @param {Number} limit
   */
  app.get('/api/users/:id/recent-notifications', 
    routeUtils.middleware.ensureSecure,
    function (req, res, next){
      var response = {
        statusCode : 200,
        body : {}
      };

      UserModel
      .findById(req.params.id)
      .select('_id')
      .exec(function (err, user) {
        if (err) { return next(err); }
        if (!user){ return next(new Error('Invalid user id'));}
        
        if (!routeUtils.checkResourceReadAccess(user, req.user)){
          response = {
            statusCode : 401,
            body : "Only the user may view user notifications."
          };
          return routeUtils.sendJSONResponse(res, response.statusCode, response.body);
        }

        async.parallel(
        [
          function getPendingNotifications(innerCallback){
            NotificationModel
            .find({
              u : req.params.id,
              tts : { $lte : new Date() }
            })
            .limit(20)
            .sort('-tts')
            .exec(innerCallback);
          },
          function getSentNotifications(innerCallback){
            // TODO : examine the execution plan of this query...hopefully it uses the u+tts index, but might be a whole table scan
            NotificationModel
            .find({
              u : req.params.id,
              'sl.ts' : { $ne : null },
              $or : [
                { tts : null },
                { tts : {$gte : new Date() }}
              ]
            })
            .sort('-sl.ts')
            .limit(10)
            .exec(innerCallback);
          },
        ],
        function parallelEnd(err, results){
          if (err) { return next(err); }
          
          var notifications = [].concat(results[0], results[1]),
              notificationObjects = notifications.map(function(notification){ return notification.toObject() }),
              notificationObjectsById = {};

          notificationObjects.forEach(function(notification){
            notificationObjectsById[notification._id] = notification;            
          });

          async.each(notifications, 
            function notificationIterator(notification, iteratorCallback){
              notification.getDisplays(
                {
                  secureAppUrl : app.config.secureAppUrl,
                  displayTypes : ['summary','detail', 'json']
                },
                function(err, notificationDisplays){
                  if (err) { return iteratorCallback(err); }

                  notificationObjectsById[notification._id].displays = notificationDisplays;

                  return iteratorCallback();
                } 
              );
            },
            function end(err){
              if (err) { return next(err); }

              response.body = {
                data : notificationObjects
              };
              response.body.count = response.body.data.length;
              return routeUtils.sendJSONResponse(res, response.statusCode, response.body);    
            }
          );

        });
      });
    }
  );

};