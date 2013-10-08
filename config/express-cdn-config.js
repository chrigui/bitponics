var path = require('path');

module.exports = function(app) {

  // var options = {
  //   publicDir  : path.join(__dirname, '/../public')
  //   , viewsDir   : path.join(__dirname, '/../views')
  //   , domain     : 'cdn.bitponics.com'
  //   , bucket     : s3Config.bucket
  //   // , endpoint   : 'http://bitponics.s3.amazonaws.com/'
  //   , key        : s3Config.key
  //   , secret     : s3Config.secret
  //   , hostname   : 'localhost'
  //   , port       : 80
  //   , ssl        : false
  //   , production : app.settings.env !== 'local' ? true : false //false means we use local assets
  //   , logger     : winston.info
  // };

  // // Initialize the CDN magic
  // var CDN = require('express-cdn')(app, options);

  // // Add the view helper
  // app.locals({ CDN: CDN() });

}