var UserModel = require('../../models/user').model,
    winston = require('winston'),
    routeUtils = require('../route-utils');

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {
  
  //List users
  app.get('/api/users', 
    routeUtils.middleware.ensureSecure, 
    routeUtils.middleware.ensureUserIsAdmin, 
    function (req, res, next){
      return UserModel.find(function (err, users) {
        if (err) { return next(err); }
        return res.send(users);
      });
    }
  );

  /*
   * Create single user
   *
   *  Test with:
   *  jQuery.post("/api/users", {
   *    "email" : "test@test.com",
   *    "name" : { "first": "Jim", "last": "Bo" },
   *    "locale": "en_US",
   *    "active" : true
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/users', 
    routeUtils.middleware.ensureSecure, 
    routeUtils.middleware.ensureUserIsAdmin, 
    function (req, res, next){
      var user;
      winston.info("POST: ");
      winston.info(req.body);
      user = new UserModel({
        email : req.body.email,
        name : req.body.name,
        locale: req.body.locale,
        active : req.body.active
      });
      user.save(function (err) {
        if (err) { return next(err); }
        return res.send(user);
      });
    }
  );

  /*
   * Read a user
   *
   * To test:
   * jQuery.get("/api/users/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/users/:id', 
    routeUtils.middleware.ensureSecure, 
    routeUtils.middleware.ensureLoggedIn, 
    function (req, res, next){
      return UserModel.findById(req.params.id, function (err, user) {
        if (err) { return next(err); }
        return res.send(user.toPublicJSON());
      });
    }
  );

  /*
   * Update a user
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/users/${id}",
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
  app.put('/api/users/:id', 
    routeUtils.middleware.ensureSecure, 
    routeUtils.middleware.ensureUserIsAdmin, 
    function (req, res, next){
      return UserModel.findById(req.params.id, function (err, user) {
        if (err) { return next(err); }
        user.actionBelowMin = req.body.actionBelowMin;
        return user.save(function (err) {
          if (err) { return next(err); }
          return res.send(user);
        });
      });
    }
  );

  /*
   * Delete a user
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/users/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/users/:id', 
    routeUtils.middleware.ensureSecure, 
    routeUtils.middleware.ensureUserIsAdmin, 
    function (req, res, next){
      return UserModel.findById(req.params.id, function (err, user) {
        if (err) { return next(err); }
        return user.remove(function (err) {
          if (err) { return next(err); }
          return res.send('');
        });
      });
    }
  );
};
