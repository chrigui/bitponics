var async = require('async'),
	winston = require('winston'),
	routeUtils = require('./route-utils'),
	ModelUtils = require('../models/utils');
	
module.exports = function(app){
	/*
	 * Admin
	 * Require authenticated user with property admin=true
	 */
	app.all('/admin*',
		routeUtils.middleware.ensureSecure, 
		routeUtils.middleware.ensureUserIsAdmin);

	/* 
	 * Admin landing
	 */
	app.get('/admin', function (req, res) {
	  res.render('admin', {
	    title: 'Bitponics Admin',
    	pageType: "app-page"
	  })
	});

	
  app.get('/admin/generate-sample-device-request', function (req, res) {
    res.render('admin/generate-sample-device-request', {
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


	app.get('/admin/photos', function (req, res, next){
		var PhotoModel = require('../models/photo').model,
			s3Config = require('../config/s3-config'),
			knox = require('knox'),
			knoxClient = knox.createClient(s3Config);

		if (req.query.s3){
			knoxClient.list({ prefix: s3Config.photoPathPrefix }, function(err, results){
				if (err) { return next(err); }
				res.send(results);
			});	
		} else {
			PhotoModel.find().exec(function(err, results){
				if (err) { return next(err); }
				res.send(results);
			})
		}
	});


	app.get('/admin/photos/upload', function (req, res){
		res.render('admin/upload-photo', {
      title: 'Bitponics Admin'
    });
	});

	
	app.post('/admin/photos/upload', function (req, res, next){
		var PhotoModel = require('../models/photo').model,
			s3Config = require('../config/s3-config'),
			knox = require('knox'),
			knoxClient = knox.createClient(s3Config),
			fs = require('fs'),
			requirejs = require('../lib/requirejs-wrapper'),
  		feBeUtils = requirejs('fe-be-utils');

		// to send the photo back as the response:
		//res.sendfile(req.files.photo.path);

		var photo = req.files.photo,
				now = new Date();

		var photoDocument = new PhotoModel({
			owner : req.user,
			originalFileName : photo.name,
			name : photo.name,
			type : photo.type,
			date : photo.lastModifiedDate || now,
			size : photo.size,
			tags : [],
			visibility : (req.body.private ? feBeUtils.VISIBILITY_OPTIONS.PRIVATE : feBeUtils.VISIBILITY_OPTIONS.PUBLIC)
		});

		knoxClient.putFile(
			photo.path, 
			s3Config.photoPathPrefix + photoDocument._id.toString(), 
			{ 'Content-Type': photo.type, 'x-amz-acl': 'private' }, 
    	function(err, result) {
      	if (err) { return next(err);  }
      
        if (result.statusCode === 200) {
        	// Delete the file from disk
        	fs.unlink(photo.path);

        	//res.send(result);
        	photoDocument.save(function(err, savedImage){
        		if (err) { return next(err); }

        		return routeUtils.sendJSONResponse(res, 200, { data : savedImage });
        	});
        }
      }
    );
	});

	


};