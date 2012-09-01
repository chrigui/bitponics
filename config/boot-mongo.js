var mongodb    = require('mongodb')
	, mongoose   = require('mongoose')
  	, mongooseAuth = require('mongoose-auth') 
	;

/**
 * module.exports is a function that modifies the app instance
 */
module.exports = function(app){
	require('./../models/user')(app);
};