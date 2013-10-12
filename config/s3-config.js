var awsConfig = require('./aws-config');

module.exports = {
	key : awsConfig.key,
	secret : awsConfig.secret,
	bucket : "bitponics",
	bucketCDN : "bitponics-cdn",
	photoPathPrefix : "photos/"	
}