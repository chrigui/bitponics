var connect    = require('connect'),
  express    = require('express'),
  http       = require('http'),
  net        = require('net'),
  fs         = require('fs'),
  stylus     = require('stylus'),
  nib        = require('nib'),
  mongodb    = require('mongodb'),
  mongoose   = require('mongoose'),
  MongoStore = require('connect-mongo')(express),
  passport   = require('passport'),
  csv        = require('express-csv'),
  winston    = require('winston'),
  flash      = require('connect-flash'),
  semver  = require('semver'),
  path    = require('path'),
  Session = connect.middleware.session.Session,
  cookie  = require('express/node_modules/cookie');

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
    app.locals({ basedir: path.join(__dirname, '/../views') });

    app.use(express.logger(':method :url :status'));


    // Since we're on Heroku (and hence behind a proxy), tell express proxied requests are cool
    // http://expressjs.com/guide.html#proxies
    app.enable('trust proxy');

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

    // by default, express adds an "X-Powered-By:ExpressJS" header. prevent that.
    app.disable('x-powered-by');

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


    require('./mongoose-connection').open(app.settings.env, function(mongooseConnection){

	    app.config.mongooseConnection = mongooseConnection;

	    app.config.session = {
	      secret : 'somethingrandom',
	      key : 'express.sid',
	      store : new MongoStore({
	        mongoose_connection : app.config.mongooseConnection
	      })
	    };	

	    // cookieParser and session handling are needed for everyauth (inside mongooseAuth) to work  (https://github.com/bnoguchi/everyauth/issues/27)
	    app.use(express.cookieParser());
	    app.use(express.session(app.config.session));

	    app.use(passport.initialize());
	    app.use(passport.session());

    });

    

    //flash messages are separate as of express 3
    app.use(flash());
    //  app.use(function(req, res, next){
    //  	res.locals.flashMessages = req.flash();
    // });


    app.socketIOs.forEach(function(io){
      // Heroku requires that we force socket.io to use long-polling
      // https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
      io.configure(function () {
        io.set("transports", ["xhr-polling"]);
        io.set("polling duration", 10);
      });

      // Make socket.io handlers aware of user sessions
      // http://stackoverflow.com/questions/13095418/how-to-use-passport-with-express-and-socket-io
      // http://howtonode.org/socket-io-auth
      // http://www.danielbaulig.de/socket-ioexpress/
      // Just attach the session if found, don't reject the handshake.
      // Make individual session routes/namespaces ensure auth'ed user when necessary
      io.set('authorization', function (handshakeData, accept) {
        var connect = require('connect'),
            Session = connect.middleware.session.Session,
            cookie  = require('express/node_modules/cookie');

        if (!handshakeData.headers.cookie) { return accept(null, true); }

        handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
        handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie[app.config.session.key], app.config.session.secret);

        // save the session store to the data object 
        // (as required by the Session constructor)
        handshakeData.sessionStore = app.config.session.store;
        handshakeData.sessionStore.get(handshakeData.sessionID, function (err, session) {
          if (session){
            // new Session requires there to be a "sessionID" and "sessionStore" property on the first argument
            handshakeData.session = new Session(handshakeData, session);
          }
          return accept(null, true);
        });
      });

      /**
       * Global onConnection handler. Do 
       * these things for all socket connections
       */
      io.sockets.on('connection', function (socket) {
        var session = socket.handshake.session;
        // setup an inteval that will keep the session fresh
        var sessionRefreshIntervalId = setInterval(function () {
            // reload the session (just in case something changed,
            // we don't want to override anything, but the age)
            // reloading will also ensure we keep an up2date copy
            // of the session with our connection.
            session.reload( function () { 
              // "touch" it (resetting maxAge and lastAccess)
              // and save it back again.
              session.touch().save();
            });
        }, 5 * 1000);

        socket.on('disconnect', function () {
          winston.info('A socket with sessionId ' + socket.handshake.sessionID
              + ' disconnected!');
          // clear the socket interval to stop refreshing the session
          clearInterval(sessionRefreshIntervalId);
        });

        socket.emit('news', { hello: 'world' });
      });
    });
    


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
          // For local, dev, & staging, want to put the whole site behind basic auth
          return connect.basicAuth(
          	function(basicAuthUsername, basicAuthPassword){
          		switch (basicAuthUsername) {
          			case "bitponics":
          				return basicAuthPassword === "8bitpass";
        				case "braintree":
        					return basicAuthPassword === "dendrite";
          		}
          		return false;
          	}
          )(req, res, next);
        }
      });
      break;
    case 'production':
      app.disable('verbose errors');

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
        }
        return next();
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
    app.use(express.errorHandler());
    app.enable('view cache');

    app.socketIOs.forEach(function(io){
    	io.enable('browser client minification');  // send minified client
	    io.enable('browser client etag');          // apply etag caching logic based on version number
	    io.enable('browser client gzip');          // gzip the file
	    io.set('log level', 1);
    });
    
  });

  app.configure('production', function(){
    app.use(express.errorHandler());
    app.enable('view cache');

    app.socketIOs.forEach(function(io){
    	io.enable('browser client minification');  // send minified client
	    io.enable('browser client etag');          // apply etag caching logic based on version number
	    io.enable('browser client gzip');          // gzip the file
	    io.set('log level', 1);
    });
  });
};