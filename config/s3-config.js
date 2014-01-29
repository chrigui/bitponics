var awsConfig = require('./aws-config');

module.exports = {
	key : awsConfig.key,
	secret : awsConfig.secret,
	bucket : "bitponics",
	bucketCDN : "bitponics-cdn",
	photoPathPrefix : "photos/"	+ (process.env.NODE_ENV === 'production' ? '' : 'test/')
}

console.log('s3-config', module.exports)