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
   * Text Logs nested resource
   * 
   * @param {Date=} req.params.start-date (optional) Should be something parsable by moment.js
   * @param {Date=} req.params.end-date (optional) Should be something parsable by moment.js
   * @param {Number} req.params.skip
   * @param {Number} req.params.limit
   *
   * Response:
   * @param {Array[TextLog]} data
   * @param {Number} count
   */
  app.get('/api/gardens/:id/text-logs', function (req, res, next){
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
          query = TextLogModel.find({ gpi : growPlanInstance._id });

      // cap the limit at 200
      if (limit > 200) { limit = 200; }

      
      // TODO : Localize start/end date based on owner's timezone?
      if (startDate){
        startDate = moment(startDate).toDate();
        query.where('ts').gte(startDate);
      }
      if (endDate){
        endDate = moment(endDate).toDate();
        query.where('ts').lt(endDate);
      }

      query.count(function(err, count){
        if (err) { return next(err); }

        // Cast the query to a find() operation so we can limit/skip/sort/select
        query.find();

        query.limit(limit);
        if (skip){
          query.skip(skip);
        }

        // Sort & field selection have to occur outside of a .count()
        query.sort('-ts');
        query.select('ts l'); // don't need to get the gpi in this query. already know it!

        query.exec(function(err, textLogResults){
          if (err) { return next(err);}

          response.data = textLogResults;
          response.count = count;
          response.limit = limit;
          response.skip = skip;

          return routeUtils.sendJSONResponse(res, 200, response);
        });
      });
    });
  });
  
  
  /**
   * Add a text log to the GPI
   *
   * @param {TextLog} req.body.textLog
   */
  app.post('/api/gardens/:id/text-logs', function (req, res, next){
    var response = { status : undefined };

    if (!req.body.textLog){
      response = {
        status : "error",
        message : "empty text log"
      };
      res.send(400, response);
    }

    GrowPlanInstanceModel.findById(req.params.id)
    .exec(function (err, growPlanInstance) {
      if (err) { return next(err); }
      if (!growPlanInstance){ return next(new Error('Invalid grow plan instance id'));}
      
      if (!routeUtils.checkResourceModifyAccess(growPlanInstance, req.user)){
        return res.send(401, "Only the grow plan instance owner may modify a grow plan instance.");
      }

      new TextLogModel(req.body.textLog)
        .save(function (err) {
          if (err) { return next(err); }
          return res.send({ status : "success" });
        });

    });
  });

};