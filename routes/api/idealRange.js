var IdealRangeModel = require('../../models/idealRange').model;

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List ideal_ranges
  app.get('/api/ideal_ranges', function (req, res){
    return IdealRangeModel.find(function (err, idealRanges) {
      if (!err) {
        return res.send(idealRanges);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Create single idealRange
   *
   *  Test with:
   *  jQuery.post("/api/ideal_ranges", {
   *    "sensor": "sensorid",
   *    "min": 0,
   *    "max": 10,
   *    "actionBelowMin": "actionid",
   *    "actionAboveMax": "actionid",
   *    "applicableTimeSpan": { 
   *      "startTime": 1344403622887,
   *      "endTime": 1344403726506
   *    }
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/ideal_ranges', function (req, res){
    var idealRange;
    console.log("POST: ");
    console.log(req.body);
    idealRange = new IdealRangeModel({
      sensor: req.body.sensor,
      min: req.body.min,
      max: req.body.max,
      actionBelowMin: req.body.actionBelowMin,
      actionAboveMax: req.body.actionAboveMax,
      applicableTimeSpan: req.body.applicableTimeSpan 
    });
    idealRange.save(function (err) {
      if (!err) {
        return console.log("created idealRange");
      } else {
        return console.log(err);
      }
    });
    return res.send(idealRange);
  });

  /*
   * Read an idealRange
   *
   * To test:
   * jQuery.get("/api/ideal_ranges/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/ideal_ranges/:id', function (req, res){
    return IdealRangeModel.findById(req.params.id, function (err, idealRange) {
      if (!err) {
        return res.send(idealRange);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Update an idealRange
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/ideal_ranges/${id}",
   *     type: "PUT",
   *     data: {
   *       "actionBelowMin": "actionid"
   *     },
   *     success: function (data, textStatus, jqXHR) {
   *         console.log("Post response:");
   *         console.dir(data);
   *         console.log(textStatus);
   *         console.dir(jqXHR);
   *     }
   * });
   */
  app.put('/api/ideal_ranges/:id', function (req, res){
    return IdealRangeModel.findById(req.params.id, function (err, idealRange) {
      idealRange.actionBelowMin = req.body.actionBelowMin;
      return idealRange.save(function (err) {
        if (!err) {
          console.log("updated idealRange");
        } else {
          console.log(err);
        }
        return res.send(idealRange);
      });
    });
  });

  /*
   * Delete an idealRange
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/ideal_ranges/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/ideal_ranges/:id', function (req, res){
    return IdealRangeModel.findById(req.params.id, function (err, idealRange) {
      return idealRange.remove(function (err) {
        if (!err) {
          console.log("removed");
          return res.send('');
        } else {
          console.log(err);
        }
      });
    });
  });
};
