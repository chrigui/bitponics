module.exports = function(app){
	app.get('/socket_graph_test', function (req, res){
	  //print_visits(req, res);
	  res.render('dashboard', {
	    title: 'Express',
	    locals : { temp: 1 }
	  });

	});

	app.get('/', function (req, res){
	  res.render('index', {
	    title: "Bitponics",
	    appUrl : app.config.appUrl
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
	app.get('/register', function(req, res) {
	  var UserModel = require('./models/user')(app).model;
	  if(req.query.verify){ //user coming back to verify account
	    return UserModel.findOne({ activation_token: req.query.verify }, function (err, user) {
	      if (!err && user && activation_token !== '') {
	        user.active = true;
	        user.save();
	        res.render('register', {
	          title: 'Register Success - Active user.',
	          newUser: user,
	          appUrl : app.config.appUrl
	        });
	      } else {
	        res.render('register', {
	          title: 'Register Failed - No matching token.',
	          appUrl : app.config.appUrl
	        });
	      }
	    });
	  }else{ //user just signed up
	    console.log('req.user:');
	    console.dir(req.user);
	    res.render('register', {
	      title: 'Thanks for signing up. Check your email.',
	      appUrl : app.config.appUrl
	    });
	  }
	});

	/**
	 * @param req : json object. Should have properties for deviceId, timestamp, log types + log values

	    POST sample:
	      POST /log HTTP/1.1
	      Accept: application/json
	      Content-Encoding: identity
	      Content-Type: application/json

	      {"deviceId":"testDeviceId","userKey":"testUserKey","logs":[{"type":"light","value":12.5,"timestamp":1338609482898}]}

	 */
	app.post('/log', function(req, res) {
	  // TODO : do some sort of device+key verification 
	  // TODO : log the log to mongo

	  console.log(req);
	  var logs = req.param('logs', []);
	  for (var i = 0, length = logs.length; i < length; i++){
	    
	  }

	  mongodb.connect(app.config.mongoUrl, function(err, conn){
	    console.log('connected to mongodb');
	    conn.collection('sensor_logs', function(err, coll){
	      console.log('writing to sensor_logs :', logs[0]);
	      coll.insert( logs[0], {safe:true}, function(err){
	        console.log('wrote to sensor_logs');
	        if(err) { console.log(err.stack); }
	        conn.close();
	      });
	    });
	  });

	  res.json({
	    'request' : {
	      'deviceId' : req.param('deviceId', ''),
	      'deviceKey' : req.param('deviceKey', ''),
	      'logs' : req.param('logs', [])
	    },
	    'targetControlStates' : {
	      'control1' : true,
	      'control2' : false
	    }
	  });
	});


	app.get('/robots.txt', function(req, res){
	  res.send('User-agent: *\r\nDisallow: /');
	});


	require('./admin')(app);
	require('./api')(app);
	require('./dashboard')(app);
	require('./demo')(app);
	require('./styleguide')(app);

};