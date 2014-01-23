var async = require('async'),
	winston = require('winston'),
	routeUtils = require('./route-utils'),
  mongoose = require('mongoose'),
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
	app.get('/photos/:photoId/:size?', routeUtils.getPhoto);

  
  /**
   * Process an uploaded photo by uploading it to S3 and storing a 
   * Photo document
   */
  app.post('/photos', routeUtils.processPhotoUpload);
};