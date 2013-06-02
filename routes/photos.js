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
	app.get('/photos/:photoId', function (req, res, next){
			
		async.waterfall(
			[
				function checkAuth(innerCallback){
					PhotoModel.findById(req.params.photoId)
					.select('owner gpi visibility')
					.lean()
					.exec(function(err, photoResult){
						if (err) { return innerCallback(err); }
						if (!photoResult){ return innerCallback(new Error("Invalid photo id"));}
						
						console.log(photoResult);
						
						if (routeUtils.checkResourceReadAccess(photoResult, req.user)){
							return innerCallback(null, true);
						}
						// fallback to checking the GPI
						if (photoResult.gpi){
							GrowPlanInstanceModel.findById(photoResult.gpi)
							.select('owner users visibility')
							.lean()
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
					// Create a fast-expiring signed S3 url
					// http://www.arbitrarytech.com/2013/03/nodejs-library-for-client-side-uploads.html
					var	url = policyGenerator.readPolicy(s3Config.photoPathPrefix + req.params.photoId, s3Config.bucket, expirationSeconds);

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