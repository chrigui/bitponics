var routeUtils = require('../route-utils'),
  winston = require('winston'),
  passport = require('passport');

module.exports = function(app){
  
  /*
   * Facebook login Passportjs Strategy
   *
   */
  // Redirect the user to Facebook for authentication.  When complete,
  // Facebook will redirect the user back to the application at
  app.get('/auth/facebook', function(req, res, next) {
    if (req.query.redirect) {
      //TODO: get this working, keep getting Facebook OAuth error with the below uncommented
      // var url = encodeURIComponent('/auth/facebook/callback?redirect='+req.query.redirect);
      // console.log(url);
      // passport.authenticate('facebook', { callbackURL: '/auth/facebook?redirect='+req.query.redirect })(req, res, next);
      // // passport.authenticate('facebook', { callbackURL: url })(req, res, next);
      passport.authenticate('facebook')(req, res, next);
    } else {
      passport.authenticate('facebook')(req, res, next);
    }
  });

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
      // console.log('req.query.redirect')
      // console.log(req.query.redirect);
      // res.redirect(req.query.redirect)
      //TODO: ideally we'd respect req.query.redirect, but passport-facebook isnt behaving
      res.redirect('/register');
    }
  );


};