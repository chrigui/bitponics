var routeUtils = require('../route-utils'),
  winston = require('winston');

module.exports = function(app){
  
  app.get('/account', 
    routeUtils.middleware.ensureSecure,
    routeUtils.middleware.ensureLoggedIn,
    function (req, res, next){
      res.render('account', {
        title : 'Account',
        className : 'account'
      });
    }
  );

  require('./profile')(app);
  require('./devices')(app);
};