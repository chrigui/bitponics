var winston = require('winston'),
	ModelUtils = require('../models/utils');

module.exports = function(app){
	/*
	 * Admin
	 * Require authenticated user with property admin=true
	 */
	app.all('/admin*', function (req, res, next) {
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

	
	app.get('/admin/trigger_clearPendingNotifications', function (req, res) {
	  ModelUtils.clearPendingNotifications(require('../models/notification').model, function(err){
	  	if (err) { 
	  		winston.error(err); 
	  		res.status(500);
	        res.send('error');
	        return;
	  	}
	  	res.status(200);
	  	res.send('success');
	  	return;
	  });
	});	

};