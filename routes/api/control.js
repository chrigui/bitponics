var ControlModel = require('../../models/control').model,
    winston = require('winston');

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List controls
  app.get('/api/controls', function (req, res, next){
    winston.info("in controls callback");
    return ControlModel.find(function (err, controls) {
      winston.info("in ControlModel callback");
      if (err) { return next(err); }

      return res.send(controls);
    });
  });

  /*
   * Create single control
   *
   *  Test with:
   *  jQuery.post("/api/controls", {
   *    "name": "pump"
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/controls', function (req, res, next){
    var control;
    winston.info("POST: ");
    winston.info(req.body);
    control = new ControlModel({
      name: req.body.name,
    });
    control.save(function (err) {
      if (err) { return next(err); }

      return winston.info("created control");
      
    });

    // TODO : move this response to the callback of .save
    return res.send(control);
  });

  /*
   * Read an control
   *
   * To test:
   * jQuery.get("/api/controls/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/controls/:id', function (req, res, next){
    return ControlModel.findById(req.params.id, function (err, control) {
      if (err) { return next(err); }

      return res.send(control);
    });
  });

  /*
   * Update an control
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/controls/${id}",
   *     type: "PUT",
   *     data: {
   *       "name": "updated pump"
   *     },
   *     success: function (data, textStatus, jqXHR) {
   *         console.log("Post response:");
   *         console.dir(data);
   *         console.log(textStatus);
   *         console.dir(jqXHR);
   *     }
   * });
   */
  app.put('/api/controls/:id', function (req, res, next){
    return ControlModel.findById(req.params.id, function (err, control) {
      control.title = req.body.title;
      return control.save(function (err) {
        if (err) { return next(err); }
        
        winston.info("updated control");
        
        return res.send(control);
      });
    });
  });

  /*
   * Delete an control
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/controls/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/controls/:id', function (req, res, next){
    return ControlModel.findById(req.params.id, function (err, control) {
      return control.remove(function (err) {
        if (err) { return next(err); }

        return res.send('');
      });
    });
  });
};
