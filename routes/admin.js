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
			fs = require('fs');

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
			tags : []
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

	app.get('/admin/photos/:photoId', function (req, res, next){
		var PhotoModel = require('../models/photo').model,
				GrowPlanInstanceModel = require('../models/growPlanInstance').model,
				routeUtils = require('./route-utils'),
				s3Config = require('../config/s3-config'),
				s3Policy = require('s3policy'),
				policyGenerator = new s3Policy(s3Config.key, s3Config.secret),
				expirationSeconds = 10,
				// Create a fast-expiring signed S3 url
				// http://www.arbitrarytech.com/2013/03/nodejs-library-for-client-side-uploads.html
				url = policyGenerator.readPolicy(s3Config.photoPathPrefix + req.params.photoId, s3Config.bucket, expirationSeconds);

		async.waterfall(
			[
				function checkAuth(innerCallback){
					PhotoModel.findById(req.params.photoId)
					.select('owner gpi visibility')
					.exec(function(err, photoResult){
						if (err) { return innerCallback(err); }
						if (!photoResult){ return innerCallback(new Error("Invalid photo id"));}
						if (routeUtils.checkResourceReadAccess(photoResult, req.user)){
							return innerCallback(null, true);
						}
						// fallback to checking the GPI
						if (photoResult.gpi){
							GrowPlanInstanceModel.findById(photoResult.gpi)
							.select('owner users visibility')
							.exec(function(err, growPlanResult){
								if (err) { return innerCallback(err); }
								return innerCallback(null, routeUtils.checkResourceReadAccess(photoResult, req.user));
							});
						} 
						else {
							return innerCallback(null, false);
						}
					});
				}
			],
			function (err, isAuthorized){
				if (err) { return next(err); }
				if (isAuthorized){
					// let the browser cache for expirationSeconds
					res.setHeader("Expires", (new Date(Date.now() + (expirationSeconds * 1000))).toUTCString());
					return res.redirect(302, url);	
				} else {
					// TODO : create a stylized 401 page
					return res.send(401);	
				}
			}
		);
	});

};