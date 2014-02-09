/**
 * @module routes/api/users
 */
 
var UserModel = require('../../../models/user').model,
    winston = require('winston'),
    routeUtils = require('../../route-utils'),
    requirejs = require('../../../lib/requirejs-wrapper'),
    feBeUtils = requirejs('fe-be-utils'),
    apiUtils = require('../utils'),
    passport = require('passport');

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

// {
//   _id: '52ef08691101fd5c8128241c',
//   name: { last: 'Bishop', first: 'Jack' },
//   email: 'john.bishop@marist.edu',
//   locale: { lang: 'en', territory: 'US' },
//   timezone: 'America/New_York',
//   active: true,
//   notificationPreferences: { email: true, sms: false },
//   deviceKeys: [],
//   apiKey: { public: 'fd4ae0988ac3db51' },
//   socialPreferences: { 
//     facebook: { permissions: [Object], accessToken: 'CAADtS0JZCrrEBANO8Ez0hhBQkZBLdOfWxv45ZBzK6kZCCZCzXBWotgK1eS3MDAGfu63b4wOfoseZAfsDtfAqlMVP16d7Q8D8ZA7a62WmrBZAlOAVupFAvrhHWt2zZC3R7lUbHhZAmJVGWfQoLv3fIj1AOzNDOAeyJa06F4Wx81NFbumBFeEf45c3FQZAMUaZBP5hmqkztTiQlumgqgZDZD' },
//     twitter: { permissions: {} },
//     google: { permissions: {} } 
//   } 
// }
        keys.forEach(function(key){
          if (typeof req.body[key] !== 'undefined') {
            user[key] = req.body[key];
          }
        });

        console.log(user.socialPreferences);
        return user.save(function (err) {
          console.log(err);
          if (err) { return next(err); }
          console.log(user.socialPreferences);
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


  /*
   * Facebook login Passportjs Strategy
   *
   */
  // Redirect the user to Facebook for authentication.  When complete,
  // Facebook will redirect the user back to the application at
  //     /auth/facebook/callback
  app.get('/auth/facebook', passport.authenticate('facebook'));

  // Facebook will redirect the user to this URL after approval.  Finish the
  // authentication process by attempting to obtain an access token.  If
  // access was granted, the user will be logged in.  Otherwise,
  // authentication has failed.
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      // scope: ['read_stream', 'publish_actions'],
      // successRedirect: '/gardens',
      failureRedirect: '/login'
    }),
    function(req, res) {
      console.dir('req.query');
      console.dir(req.query);
      // console.dir(res);
      res.redirect(req.query.redirect)
    }
  );
  
};
