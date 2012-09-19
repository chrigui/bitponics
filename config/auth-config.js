var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    HmacStrategy = require('../lib/passport-hmac').Strategy,
    User = require('../models/user').model,    
    oauthConfigs = {
        fb: {
          appId: '260907493994161',
          appSecret: '374abde8cd83d33bbea039b14ab208d9'
        },
        twitter: {
            consumerKey: 'PyyZ8tnqCrLqpZHrLx56w',
            consumerSecret: 'USgcvujBuqpRRLwWXRCXK159gNtJ4zj0FBmMvhNDbKM'
        },
        google: {
            clientId: '278080134499.apps.googleusercontent.com',
            clientSecret: 'lQD_LRWm1aNkJLuUJZ_pn1oI'
        }
    };

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(email, password, done) {
    User.authenticate(email, password, function(err, user) {
      return done(err, user);
    });
  }
));

passport.use(new HmacStrategy({
  name : 'device',
  scheme : 'BPN_DEVICE',
  getUser : User.getByPublicDeviceKey
}));

passport.use(new HmacStrategy({
  name : 'api',
  scheme : 'BPN_API',
  getUser : User.getByPublicApiKey
}));

      
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

module.exports = function(app){
        
};

