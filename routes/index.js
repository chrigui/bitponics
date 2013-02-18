var User = require('../models/user').model,
	winston = require('winston'),
	passport = require('passport'),
	verificationEmailDomain = 'bitponics.com';

module.exports = function(app){

	// global middleware
	app.all('*', function (req, res, next){
		res.locals({
			user : req.user
		});
		res.removeHeader('X-Powered-By');
		next();
	});


	app.get('/socket_graph_test', function (req, res){
	  //print_visits(req, res);
	  res.render('dashboard', {
	    title: 'Express',
	    locals : { temp: 1 }
	  });

	});

	app.get('/', function (req, res){
	  var locals = {
    	title: "Bitponics",
    	className: "landing-page"
    };
	  res.render('index', locals);
	});

	app.get('/about', function (req, res){
	  var locals = {
    	title: "About",
    	className: "landing-page about"
    };
	  res.render('about', locals);
	});

	app.get('/howitworks', function (req, res){
	  var locals = {
    	title: "How It Works",
    	className: "landing-page single-page howitworks"
    };
	  res.render('howitworks', locals);
	});

	app.get('/gallery', function (req, res){
	  var locals = {
    	title: "Gallery",
    	className: "landing-page single-page gallery"
    };
	  res.render('gallery', locals);
	});

	app.get('/pricing', function (req, res){
	  var locals = {
    	title: "Pricing",
    	className: "landing-page single-page pricing"
    };
	  res.render('pricing', locals);
	});

	app.get('/press', function (req, res){
	  var locals = {
    	title: "Press",
    	className: "landing-page single-page press"
    };
	  res.render('press', locals);
	});

	app.get('/contact', function (req, res){
	  var locals = {
    	title: "Contact",
    	className: "landing-page single-page contact"
    };
	  res.render('contact', locals);
	});

	app.get('/team', function (req, res){
	  var locals = {
    	title: "Our Team",
    	className: "landing-page single-page team"
    };
	  res.render('team', locals);
	});

	app.get('/getstarted', function (req, res){
	  var locals = {
    	title: "Get Started",
    	className: "landing-page single-page getstarted"
    };
	  res.render('getstarted', locals);
	});

	app.get('/login', function (req, res){
		var redirect = req.query.redirect,
			locals = {
				title: 'Login',
				formAction : '/login',
				className: "landing-page single-page getstarted"
			};

		if (redirect){
			locals.formAction += '?redirect=' + redirect;
		}

		res.render('login', locals);
	});

	app.post('/login', function (req, res, next){
		passport.authenticate('local', function(err, user, info) {
		    if (err) { return next(err); }
		    if (!user) {
		    	console.log(info)
		      req.flash('error', info.message);
		      return res.redirect('/login')
		    }
		    req.logIn(user, function(err) {
		      if (err) { return next(err); }
		      return res.redirect(req.query.redirect || '/dashboard');
		    });
	    })(req, res, next);
	});

	app.get('/signup', function (req, res){
		res.render('signup', {
			title : 'Signup',
			className: "landing-page single-page getstarted"
		});
	});

	

	app.post('/signup', function (req, res, next){
		User.createUserWithPassword({
			email: req.param('email')
		},
		req.param('password'),
		function(err, user){
			if (err) { return next(err); }
			req.logIn(user, function(err) {
		      if (err) { return next(err); }
		      res.redirect('/register');
		    });
		});
	});
		
	app.get('/logout', function (req, res) {
	  req.logout();
	  res.redirect('/');
	});
	

	
	/*
	 * Email verification
	 * 
	 */
	app.get('/register', function (req, res, next) {
	  var UserModel = require('../models/user').model;
	  if(req.query.verify){ //user coming back to verify account
	    return UserModel.findOne({ activationToken: req.query.verify }, 
	    	function (err, user) {
		    	if (err) { return next(err); }
					if (user && user.activationToken !== '') {
						user.active = true;
						user.sentEmail = true; //if we get here, this should be true
						user.save( function(err, user){
							if (err) { return next(err); }
							res.render('register', {
								title: 'Welcome to Bitponics!',
								message: 'Your registration was successfull.',
								user: user,
								className: "landing-page single-page getstarted register"
							});
						});
					} else {
						res.render('register', {
							title: 'Welcome to Bitponics!',
							message: "There was an error validating your account. Please sign up again.",
							className: "landing-page single-page getstarted register"
						});
					}
	    	}
    	);
	  } else { //user just signed up
	    winston.info('req.user:');
	    winston.info(req.user);
	    res.render('register', {
	      title: 'Register',
	      message: 'Thanks for signing up. Check your email.',
	      className: "landing-page single-page getstarted register"
	    });
	  }
	});

	app.get('/robots.txt', function (req, res){
	  res.send('User-agent: *\r\nDisallow: /');
	});


	require('./admin')(app);
	require('./api')(app);
	require('./dashboard')(app);
	require('./demo')(app);
	require('./setup')(app);
	require('./styleguide')(app);
	require('./profile')(app);
	require('./growplans')(app);
	require('./reset')(app);

	/*
	 * Legacy PHP site routes
	 */
	require('./legacy')(app);


	// The call to app.use(app.router); is to position the route handler in the middleware chain.
	// Everything afterward is assumed to have not matched a route.
	// https://github.com/visionmedia/express/blob/master/examples/error-pages/index.js
	app.use(app.router);
};