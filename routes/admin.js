var winston = require('winston'),
	routeUtils = require('./route-utils'),
	ModelUtils = require('../models/utils');

module.exports = function(app){
	/*
	 * Admin
	 * Require authenticated user with property admin=true
	 */
	app.all('/admin*', 
		routeUtils.middleware.ensureSecure, 
		routeUtils.middleware.ensureUserIsAdmin, 
		function (req, res, next) {
		  if (req.user.admin) {
		    next();
		  } else {
		    res.redirect('/login?redirect=' + req.url);
		  }
		}
	);

	/* 
	 * Admin landing
	 */
	app.get('/admin', function (req, res) {
	  res.render('admin', {
	    title: 'Bitponics Admin'
	  })
	});

	app.get('/admin/add-device', function (req, res) {
	  res.render('admin/add-device', {
	    title: 'Bitponics Admin'
	  })
	});

  app.post('/admin/add-device', function (req, res) {
    
    res.render('admin/add-device', {
      title: 'Bitponics Admin',
      creationStatus : 'success'
    })
  });
		
	app.post('/admin/trigger_clearPendingNotifications', function (req, res) {
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

	app.post('/admin/trigger_scanForPhaseChanges', function (req, res) {
	  ModelUtils.scanForPhaseChanges(require('../models/growPlanInstance').model, function(err){
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