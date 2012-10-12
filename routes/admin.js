var winston = require('winston');

module.exports = function(app){
	/*
	 * Admin
	 * Require authenticated user with property admin=true
	 */
	app.all('/admin*', function (req, res, next) {
	  winston.dir(req.user);
	  winston.dir(req.loggedIn);
	  if (req.user.admin) {
	    next();
	  } else {
	    res.redirect('/login');
	  }
	});

	/* 
	 * Admin landing
	 */
	app.get('/admin/', function (req, res) {
	  res.render('admin', {
	    title: 'Bitponics Admin'
	  })
	});
};