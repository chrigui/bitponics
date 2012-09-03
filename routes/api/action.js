var ActionModel = require('../../models/action').model;

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List actions
  app.get('/api/action', function (req, res){
    console.log("in actions callback");
    return ActionModel.find(function (err, actions) {
      console.log("in ActionModel callback");
      if (!err) {
        return res.send(actions);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Create single action
   *
   *  Test with:
   *  jQuery.post("/api/action", {
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
   *      "stopAfterRepetitionCount": 2
   *    }
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/action', function (req, res){
    var action;
    console.log("POST: ");
    console.log(req.body);
    action = new ActionModel({
      description: req.body.description,
      control: req.body.control,
      cycle: req.body.cycle
    });
    action.save(function (err) {
      if (!err) {
        return console.log("created action");
      } else {
        return console.log(err);
      }
    });
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
  app.get('/api/action/:id', function (req, res){
    return ActionModel.findById(req.params.id, function (err, action) {
      if (!err) {
        return res.send(action);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Update an action
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/action/${id}",
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
  app.put('/api/action/:id', function (req, res){
    return ActionModel.findById(req.params.id, function (err, action) {
      action.description = req.body.description;
      return action.save(function (err) {
        if (!err) {
          console.log("updated action");
        } else {
          console.log(err);
        }
        return res.send(action);
      });
    });
  });

  /*
   * Delete an action
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/action/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/action/:id', function (req, res){
    return ActionModel.findById(req.params.id, function (err, action) {
      return action.remove(function (err) {
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
