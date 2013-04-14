var winston = require('winston'),
		routeUtils = require('../../route-utils');

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List phases
  app.get('/api/grow-plans/:growPlanId/phases', function (req, res, next){
    /*
    return PhaseModel.find(function (err, phases) {
      if (err) { return next(err); }
      return res.send(phases);
    });
*/
  });

  /*
   * Create single phase
   *
   *  Test with:
   *  jQuery.post("/api/phases", {
   *    "name": "Bloom",
   *    "expectedNumberOfDays": 25,
   *    "light": "lightid",
   *    "actions": ["actionid1", "actionid2", "actionid3"],
   *    "idealRanges": ["idealRangeid1", "idealRange2"],
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/grow-plans/:growPlanId/phases', function (req, res, next){
    /*
    var phase;
    winston.info("POST: ");
    winston.info(req.body);
    phase = new PhaseModel({
      name: req.body.type,
      expectedNumberOfDays: req.body.expectedNumberOfDays,
      light: req.body.light,
      growSystem: req.body.growSystem,
      growMedium: req.body.growMedium,
      nutrients: req.body.nutrients,
      actions: req.body.actions,
      idealRanges: req.body.idealRanges,
    });
    phase.save(function (err) {
      if (err) { return next(err); }
      return res.send(phase);
    });
*/
  });

  /*
   * Read an phase
   *
   * To test:
   * jQuery.get("/api/phases/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/grow-plans/:growPlanId/phases/:id', function (req, res, next){
    /*
    return PhaseModel.findById(req.params.id, function (err, phase) {
      if (err) { return next(err); }
      return res.send(phase);
    });
*/
  });

  /*
   * Update an phase
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/phases/${id}",
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
  app.put('/api/grow-plans/:growPlanId/phases/:id', function (req, res, next){
    /*
    return PhaseModel.findById(req.params.id, function (err, phase) {
      if (err) { return next(err); }
      phase.actionBelowMin = req.body.actionBelowMin;
      return phase.save(function (err) {
        if (err) { return next(err); }
        return res.send(phase);
      });
    });
*/
  });

  /*
   * Delete an phase
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/phases/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/grow-plans/:growPlanId/phases/:id', function (req, res, next){
    /*
    return PhaseModel.findById(req.params.id, function (err, phase) {
      if (err) { return next(err); }
      return phase.remove(function (err) {
        if (err) { return next(err); }
        return res.send('');
      });
    });
*/
  });

};
