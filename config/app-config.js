var connect    = require('connect'),
	express    = require('express'),
	http       = require('http'),
	net        = require('net'),
	fs         = require('fs'),
	stylus     = require('stylus'),
	nib        = require('nib'),
	mongodb    = require('mongodb'),
	mongoose   = require('mongoose'),
	passport   = require('passport'),
	csv        = require('express-csv'),
	winston    = require('winston'),
	flash      = require('connect-flash'),
	semver  = require('semver'),
  	path    = require('path');

module.exports = function(app){
	
	/**
	 * Standard config. 
	 * Should go first so env-specific ones are simply adding on to it 
	 * & guaranteeing that their middleware executes after this is all set up
	 */
	app.configure(function(){

	  app.use(stylus.middleware({
		    src: __dirname + '/../stylus/', // .styl files are located in `/stylus`
		    dest: __dirname + '/../public/', // .styl resources are compiled `/stylesheets/*.css`
		    debug: true,
		    compile: function(str, path) { // optional, but recommended
		      return stylus(str)
		        //.define('url', stylus.url({ paths: [__dirname + '/public'] }))
		        .set('filename', path)
		        .set('warn', true)
		        .set('compress', false)
		        .use(nib());
		      }
		  })
	  );  
	  
	  app.set('view engine', 'jade');
	  
	  app.use(express.logger(':method :url :status'));

	  // If we've got a device request or an HMAC-authed request, need the raw body
	  app.use (function(req, res, next) {
	  	var contentType = req.headers['content-type'] || '',
	  		authHeader = req.headers['authorization'] || '';
		
		if( (contentType.indexOf('application/vnd.bitponics') >= 0) || 
			(authHeader.indexOf('BPN_DEVICE') >= 0) ||
			(authHeader.indexOf('BPN_API') >= 0) 
			){
		    var data='';
		    req.setEncoding('utf8');
		    req.on('data', function(chunk) { 
		    	data += chunk;
		    });
		    req.on('end', function() {
		        req.rawBody = data;
		        next();
		    });
		} else{
			next();
		}
	  });

	  app.use(express.bodyParser());
	  app.use(express.methodOverride());
	  
	  app.use(express.favicon(__dirname + '/../public/favicon.ico', { maxAge: 2592000000 }));
	  app.use(express.static(path.join(__dirname, '/../public')));
	  
	  // Set the CDN options
	  
	  var options = {
	      publicDir  : path.join(__dirname, '/../public')
	    , viewsDir   : path.join(__dirname, '/../views')
	    , domain     : 'cdn.bitponics.com'
	    , bucket     : 'bitponics'
	    , endpoint   : 'http://bitponics.s3.amazonaws.com/'
	    , key        : 'AKIAIU5OC3NSS5DGS4RQ'
	    , secret     : '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'
	    , hostname   : 'localhost'
	    , port       : 80
	    , ssl        : false
	    , production : false //false means we use local assets
	    , logger     : winston.info
	  };

	  // Initialize the CDN magic
	  var CDN = require('express-cdn')(app, options);

	  // Add the view helper
	  // if (semver.lt(express.version, '3.0.0')) {
	    app.locals({ CDN: CDN() });
	  // } else {
	  //   app.dynamicHelpers({ CDN: CDN });
	  // }

	  // cookieParser and session handling are needed for everyauth (inside mongooseAuth) to work  (https://github.com/bnoguchi/everyauth/issues/27)
	  app.use(express.cookieParser()); 
	  app.use(express.session({ secret: 'somethingrandom'}));
	  
	  //flash messages are separate as of express 3
	  app.use(flash());

	  mongoose.connect(app.config.mongoUrl);
	  app.use(passport.initialize());
 	  app.use(passport.session());

 	  // custom "verbose errors" setting
	  // which we can use in the templates
	  // via settings['verbose errors']
	  app.enable('verbose errors');
	});

	// Configure options that most environments should have
	switch(app.settings.env){
	    case 'local':
	    case 'development':
	    case 'staging':
	    	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	  
			// make the response markup pretty-printed
			app.locals({pretty: true });
	    case 'production':
	    	app.disable('verbose errors');
	    	// Ensure that this is an authenticated request.
	    	// If it doesn't already have a req.user, 
	    	// check whether it's attempting HMAC auth,
	    	// and finally fallback to checking Basic auth
	    	app.use(function(req, res, next){
	    		var authorization = req.headers.authorization,
	    			scheme;

	    		if (req.user){ 
	    			return next();
	    		} else {
	    			if (authorization){
	    				scheme = authorization.split(' ')[0];
		    			switch(scheme){
		    				case 'BPN_DEVICE':
		    					return passport.authenticate('device', {session: false})(req, res, next);
		    				case 'BPN_API':
		    					return passport.authenticate('api', {session: false})(req, res, next);
	    					// no default. just let it flow down to the connect.basicAuth
	    				}
	    			}
					return connect.basicAuth('bitponics', '8bitpass')(req, res, next);	
	    		}
	    	});

	    	//we probably want to do something like this on heroku:
	    	//redirect to https
				// app.use(function(req, res, next) {
				// 		//this is only present on heroku
				//     var schema = req.headers["x-forwarded-proto"];
				 		
				//     if (schema === "https")
				//         return next();
				 		
				//     res.redirect("https://" + req.headers.host + req.url);
				// });


	      	break;
	}

	app.configure('local', function(){
	});

	app.configure('development', function(){
	});

	app.configure('staging', function(){
	});
	
	app.configure('production', function(){
	  app.use(express.errorHandler()); 
	  app.enable('view cache');
	});
};