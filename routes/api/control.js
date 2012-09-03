var ControlModel = require('../../models/control').model;

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List controls
  app.get('/api/control', function (req, res){
    console.log("in controls callback");
    return ControlModel.find(function (err, controls) {
      console.log("in ControlModel callback");
      if (!err) {
        return res.send(controls);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Create single control
   *
   *  Test with:
   *  jQuery.post("/api/control", {
   *    "name": "pump"
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/control', function (req, res){
    var control;
    console.log("POST: ");
    console.log(req.body);
    control = new ControlModel({
      name: req.body.name,
    });
    control.save(function (err) {
      if (!err) {
        return console.log("created control");
      } else {
        return console.log(err);
      }
    });
    return res.send(control);
  });

  /*
   * Read an control
   *
   * To test:
   * jQuery.get("/api/control/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/control/:id', function (req, res){
    return ControlModel.findById(req.params.id, function (err, control) {
      if (!err) {
        return res.send(control);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Update an control
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/control/${id}",
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
  app.put('/api/control/:id', function (req, res){
    return ControlModel.findById(req.params.id, function (err, control) {
      control.title = req.body.title;
      return control.save(function (err) {
        if (!err) {
          console.log("updated control");
        } else {
          console.log(err);
        }
        return res.send(control);
      });
    });
  });

  /*
   * Delete an control
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/control/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/control/:id', function (req, res){
    return ControlModel.findById(req.params.id, function (err, control) {
      return control.remove(function (err) {
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
