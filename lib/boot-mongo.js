var mongodb    = require('mongodb')
	, mongoose   = require('mongoose')
  	, mongooseAuth = require('mongoose-auth') // https://github.com/bnoguchi/mongoose-auth
	;

/**
 * module.exports is a function that modifies the app instance
 */
module.exports = function(app){
	app.mongoose = mongoose;
	app.mongooseAuth = mongooseAuth;

	require('./../models/user')(app);
};