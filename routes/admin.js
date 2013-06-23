var async = require('async'),
	winston = require('winston'),
	routeUtils = require('./route-utils'),
	ModelUtils = require('../models/utils');
	
module.exports = function(app){
	
	/**
	 * Intercept all admin routes and require authenticated user with property admin=true
	 */
	app.all('/admin*',
		routeUtils.middleware.ensureSecure, 
		routeUtils.middleware.ensureUserIsAdmin);


	/**
	 * Admin landing
	 */
	app.get('/admin', function (req, res) {
	  res.render('admin', {
	    title: 'Bitponics Admin',
    	pageType: "app-page"
	  })
	});

	
	/**
	 * 
	 */
  app.get('/admin/generate-sample-device-request', function (req, res) {
    res.render('admin/generate-sample-device-request', {
      title: 'Bitponics Admin'
    })
  });


  /**
	 * 
	 */
  app.get('/admin/add-device', function (req, res) {
	  res.render('admin/add-device', {
	    title: 'Bitponics Admin'
	  })
	});


  /**
	 * 
	 */
  app.post('/admin/add-device', function (req, res) {
    res.render('admin/add-device', {
      title: 'Bitponics Admin',
      creationStatus : 'success'
    })
  });
	

	/**
	 * 
	 */
	app.post('/admin/trigger-clearPendingNotifications', function (req, res) {
	  ModelUtils.clearPendingNotifications(require('../models/notification').model, function(err, numberNotificationsAffected){
	  	if (err) { 
	  		winston.error(err); 
	  		return res.send(500, err);
	  	}
	  	return res.send(200, 'success, ' + numberNotificationsAffected + ' records affected');
	  });
	});

	
	/**
	 * 
	 */
	app.post('/admin/trigger-scanForPhaseChanges', function (req, res) {
	  ModelUtils.scanForPhaseChanges(require('../models/growPlanInstance').model, function(err){
	  	if (err) { 
	  		winston.error(err); 
	  		return res.send(500, err);
	  	}
	  	return res.send(200, 'success');
	  });
	});


	/**
	 * 
	 */
	app.post('/admin/trigger-checkDeviceConnections', function (req, res) {
	  ModelUtils.checkDeviceConnections(function(err){
	  	if (err) { 
	  		winston.error(err); 
	  		return res.send(500, err);
	  	}
	  	return res.send(200, 'success');
	  });
	});


	/**
	 * 
	 */
	app.post('/admin/trigger-processUnreadEmailPhotos', function (req, res) {
	  var PhotoModel = require('../models/photo').model,
	  	emailFetcher = require('../utils/email-photo-fetcher');

	  emailFetcher.processUnreadEmails(PhotoModel, function(err, photos){
	  	console.log("processUnreadEmails result ", err, photos);
	  	if (err){
	  		return res.send(500, err);
	  	}
	  	return res.send(200, photos);
	  });
	});



	/**
	 * 
	 */
	app.post('/admin/trigger-processNewFTPPhotos', function (req, res) {
	  var PhotoModel = require('../models/photo').model,
	  	ftpPhotoFetcher = require('../utils/ftp-photo-fetcher');

	  ftpPhotoFetcher.processNewPhotos(PhotoModel, function(err, photos){
	  	console.log("processNewPhotos result ", err, photos);
	  	if (err){
	  		return res.send(500, err);
	  	}
	  	return res.send(200, photos);
	  });
	});


	
	/**
	 * Get listing of all photos in database or S3
	 */
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


	
	/**
	 * Get the photo upload form
	 */
	app.get('/admin/photos/upload', function (req, res){
		res.render('admin/upload-photo', {
      title: 'Bitponics Admin'
    });
	});

	
	
	/**
	 * Process an uploaded photo by uploading it to S3 and storing a 
	 * Photo document
	 */
	app.post('/admin/photos/upload', function (req, res, next){
		var PhotoModel = require('../models/photo').model,
			photo = req.files.photo,
			now = new Date();


		// to send the photo back as the response:
		//res.sendfile(req.files.photo.path);

		PhotoModel.createAndStorePhoto(
			{
				owner : req.user,
				originalFileName : photo.name,
				name : photo.name,
				contentType : photo.type,
				date : photo.lastModifiedDate || (new Date()),
				size : photo.size,
				visibility : (req.body.private ? feBeUtils.VISIBILITY_OPTIONS.PRIVATE : feBeUtils.VISIBILITY_OPTIONS.PUBLIC),
				streamPath : photo.path
			},
			function(err, photo){
				if (err) { return next(err); }
				return routeUtils.sendJSONResponse(res, 200, { data : photo });				
			}
		);
	});

	


};