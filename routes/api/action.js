var ActionModel = require('../../models/action').model,
    winston = require('winston');

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List actions
  app.get('/api/actions', function (req, res, next){
    winston.info("in actions callback");
    return ActionModel.find(function (err, actions) {
      winston.info("in ActionModel callback");
      if (err) { return next(err); }

      return res.send(actions);
    });
  });

  /*
   * Create single action
   *
   *  Test with:
   *  jQuery.post("/api/actions", {
   *    "description": "action description text",
   *    "control": "controlid",
   *    "cycle": {
   *      "states": [{
   *        controlValue: "",
   *        durationType: "",
   *        duration: "",
   *        message: ""
   *      },{
   *        controlValue: "",
   *        durationType: "",
   *        duration: "",
   *        message: ""
   *      }],
   *      "repeat": true
   *    }
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/actions', function (req, res, next){
    var action;
    winston.info("POST: ");
    winsotn.info(req.body);
    action = new ActionModel({
      description: req.body.description,
      control: req.body.control,
      cycle: req.body.cycle
    });
    action.save(function (err) {
      if (err) { return next(err); }

      return winston.info("created action");
      
    });
    // TODO: send this response in the callback of save
    return res.send(action);
  });

  /*
   * Read an action
   *
   * To test:
   * jQuery.get("/api/action/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/actions/:id', function (req, res, next){
    return ActionModel.findById(req.params.id, function (err, action) {
      if (err) { return next(err); }

      return res.send(action);
    });
  });

  /*
   * Update an action
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/actions/${id}",
   *     type: "PUT",
   *     data: {
   *       "description": "New action description"
   *     },
   *     success: function (data, textStatus, jqXHR) {
   *         console.log("Post response:");
   *         console.dir(data);
   *         console.log(textStatus);
   *         console.dir(jqXHR);
   *     }
   * });
   */
  app.put('/api/actions/:id', function (req, res, next){
    return ActionModel.findById(req.params.id, function (err, action) {
      action.description = req.body.description;
      return action.save(function (err) {
        if (err) { return next(err); }
        
        winston.info("updated action");
        return res.send(action);
      });
    });
  });

  /*
   * Delete an action
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/actions/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/actions/:id', function (req, res, next){
    return ActionModel.findById(req.params.id, function (err, action) {
      return action.remove(function (err) {
        if (err) { return next(err); }

        winston.info("removed");
        return res.send('');
      });
    });
  });
};
