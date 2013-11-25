var async = require('async'),
	winston = require('winston'),
	routeUtils = require('./route-utils'),
	ModelUtils = require('../models/utils'),
	PhotoModel = require('../models/photo').model,
	GrowPlanInstanceModel = require('../models/growPlanInstance').model,
	routeUtils = require('./route-utils'),
	s3Config = require('../config/s3-config'),
	s3Policy = require('s3policy'),
	policyGenerator = new s3Policy(s3Config.key, s3Config.secret),
	expirationSeconds = 10;
	

module.exports = function(app){
	
	/**
	 * Route to retrieve any user-uploaded photo.
	 * Verifies that the requesting user has access to the photo.
	 * Returns a redirect to the image asset on S3
	 */
	app.get('/photos/:photoId/:size?', function (req, res, next){
			
		async.waterfall(
			[
				function checkAuth(innerCallback){
					PhotoModel.findById(req.params.photoId)
					.select('owner gpi visibility')
					.lean()
					.exec(function(err, photoResult){
						if (err) { return innerCallback(err); }
						
            // to just return redirect URL regardless:
						// if (!photoResult){ return innerCallback(null, true);}
						
            if (!photoResult){ return innerCallback(new Error("Invalid photo id"));}
						
						// first check access on the photo
            if (routeUtils.checkResourceReadAccess(photoResult, req.user)){
							return innerCallback(null, true);
						}
						
            // if that returns false, maybe the user has access by being a member of the garden
						if (photoResult.gpi){
							GrowPlanInstanceModel.findById(photoResult.gpi)
							.select('owner users visibility')
							.lean()
							.exec(function(err, growPlanInstanceResult){
								if (err) { return innerCallback(err); }
								return innerCallback(null, routeUtils.checkResourceReadAccess(growPlanInstanceResult, req.user));
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
					// Create a fast-expiring signed S3 url
					// http://www.arbitrarytech.com/2013/03/nodejs-library-for-client-side-uploads.html
					var s3PhotoPath = s3Config.photoPathPrefix + req.params.photoId;
          if (req.params.size){
            s3PhotoPath += '/' + req.params.size;
          }

          var	url = policyGenerator.readPolicy(s3PhotoPath, s3Config.bucket, expirationSeconds);

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

  
  /**
   * Process an uploaded photo by uploading it to S3 and storing a 
   * Photo document
   */
  app.post('/photos', routeUtils.processPhotoUpload);
};