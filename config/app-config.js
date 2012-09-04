var connect    = require('connect'),
	express    = require('express'),
	http       = require('http'),
	net        = require('net'),
	fs         = require('fs'),
	stylus     = require('stylus'),
	nib        = require('nib'),
	everyauth  = require('everyauth'),
	mongodb    = require('mongodb'),
	mongoose   = require('mongoose'),
	mongooseAuth = require('mongoose-auth'),
	csv        = require('express-csv'),
	winston    = require('winston');

module.exports = function(app){
	

	app.configure('local', function(){
	});

	app.configure('development', function(){
	  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	  
	  // make the response markup pretty-printed
	  app.locals({pretty: true });

	  everyauth.debug = true;
	  everyauth.everymodule.moduleTimeout(-1); // to turn off timeouts

	  app.use(connect.basicAuth('bitponics', '8bitpass'));
	});

	app.configure('staging', function(){
		app.use(connect.basicAuth('bitponics', '8bitpass'));
	});
	
	app.configure('production', function(){
	  app.use(express.errorHandler()); 

	  // TEMP : remove basic auth after launch
	  app.use(connect.basicAuth('bitponics', '8bitpass'));
	});

	/**
	 * Standard config
	 */
	app.configure(function(){
	  var stylusMiddleware = stylus.middleware({
	    src: __dirname + '/../stylus/', // .styl files are located in `/stylus`
	    dest: __dirname + '/../public/', // .styl resources are compiled `/stylesheets/*.css`
	    debug: true,
	    compile: function(str, path) { // optional, but recommended
	      return stylus(str)
	        //.define('url', stylus.url({ paths: [__dirname + '/public'] }))
	        .set('filename', path)
	        .set('warn', true)
	        .set('compress', true)
	        .use(nib());
	      }
	  });
	  app.use(stylusMiddleware);  
	  
	  app.set('view engine', 'jade');
	  
	  app.use(express.logger(':method :url :status'));

	  app.use (function(req, res, next) {
		if(req.headers['content-type'] == 'text/csv'){
		    var data='';
		    req.setEncoding('utf8');
		    req.on('data', function(chunk) { 
		       data += chunk;
		    });

		    req.on('end', function() {
		        req.rawBody = data;
		        next();
		    });
		}else{
			next();
		}
	  });

	  app.use(express.bodyParser());
	  app.use(express.methodOverride());
	  
	  app.use(express.static(__dirname + '/../public'));
	  
	  // cookieParser and session handling are needed for everyauth (inside mongooseAuth) to work  (https://github.com/bnoguchi/everyauth/issues/27)
	  app.use(express.cookieParser()); 
	  app.use(express.session({ secret: 'somethingrandom'}));
	  
	  mongoose.connect(app.config.mongoUrl);
	  app.use(mongooseAuth.middleware(app));
	  mongooseAuth.helpExpress(app);

	  app.locals({
	    everyauth: everyauth
	  });

	  winston.add(require('winston-loggly').Loggly, {
	    subdomain : app.config.loggly.subdomain,
	    inputToken : app.config.loggly.tokens[app.settings.env],
	    level : 'error'
	  });  

	  // must add the router after mongoose-auth has added its middleware (https://github.com/bnoguchi/mongoose-auth)
	  // per mongoose-auth readme, don't need this since express handles it
	  //app.use(app.router); 

	});
};