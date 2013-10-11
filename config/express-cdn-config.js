var semver  = require('semver'),
    path    = require('path');

module.exports = function(app) {

  // Set the CDN options
  var options = {
      publicDir  : path.join(__dirname, 'public')
    , viewsDir   : path.join(__dirname, 'views')
    , domain     : 'cdn.bitponics.com'
    , bucket     : 'bitponics'
    //, endpoint   : 'bitponics.s3-eu-west-1.amazonaws.com' // optional
    , key        : 'AKIAIU5OC3NSS5DGS4RQ'
    , secret     : '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'
    , hostname   : 'localhost'
    , port       : 80
    , ssl        : false
    , production : true
  };

  // Initialize the CDN magic
  var CDN = require('express-cdn')(app, options);

  // app.configure(function() {
  //   app.set('view engine', 'jade');
  //   app.set('view options', { layout: false, pretty: true });
  //   app.enable('view cache');
  //   app.use(express.bodyParser());
  //   app.use(express.static(path.join(__dirname, 'public')));
  // });

  // Add the view helper
  if (semver.lt(express.version, '3.0.0')) {
    app.locals({ CDN: CDN() });
  } else {
    app.dynamicHelpers({ CDN: CDN });
  }

  // app.get('/', function(req, res, next) {
  //   res.render('basic');
  //   return;
  // });

}