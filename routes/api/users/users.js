/**
 * @module routes/api/users
 */
 
var UserModel = require('../../../models/user').model,
    winston = require('winston'),
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


  app.post('/api/users/:id', 
    routeUtils.middleware.ensureSecure, 
    routeUtils.middleware.ensureLoggedIn, 
    function (req, res, next){
      return UserModel.findById(req.params.id, function (err, user) {
        if (err) { return next(err); }

        var keys = Object.keys(req.body);

        if (!routeUtils.checkResourceModifyAccess(user, req.user)){
          return res.send(401, "Only resource owner may modify a resource.");
        }
        
        keys.forEach(function(key){
          if (typeof req.body[key] !== 'undefined') {
            user[key] = req.body[key];
          }
        });

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
