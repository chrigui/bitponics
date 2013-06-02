var awsConfig = require('./aws-config');

module.exports = {
	key : awsConfig.key,
	secret : awsConfig.secret,
	bucket : "bitponics",
	imagePathPrefix : "images/"	
}