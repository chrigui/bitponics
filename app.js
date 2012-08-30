
/**
 * Module dependencies.
 */

var express    = require('express'),
  Routes     = require('./routes'),
  Styleguide  = require('./routes/styleguide'),
  http       = require('http'),
  net        = require('net'),
  fs         = require('fs'),
  stylus     = require('stylus'),
  nib        = require('nib'),
  everyauth  = require('everyauth'),
  mongodb    = require('mongodb'),
  mongoose   = require('mongoose'),
  mongooseAuth = require('mongoose-auth'),
  app        = module.exports = express(),
  io         = require('socket.io').listen(app),
  cache      = {},
  tcpGuests  = [],
  Dashboard  = require('./routes/dashboard')(app),
  csv        = require('express-csv'),
  winston    = require('winston');





/**
 * Configure the app instance
 */
require('./lib/config')(app);
require('./lib/boot-mongo')(app);

io.configure(function () { 
    io.set("transports", ["xhr-polling"]); 
    io.set("polling duration", 10); 
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  
  // make the response markup pretty-printed
  app.locals({pretty: true });

  everyauth.debug = true;
  everyauth.everymodule.moduleTimeout(-1); // to turn off timeouts
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.configure(function(){
  var stylusMiddleware = stylus.middleware({
    src: __dirname + '/stylus/', // .styl files are located in `/stylus`
    dest: __dirname + '/public/', // .styl resources are compiled `/stylesheets/*.css`
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
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  
  app.use(express.static(__dirname + '/public'));
  
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




// Routes

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

app.get('/dashboard', Dashboard.index);

app.get('/styleguide', function(req, res) {
  res.render('styleguide', {
    title: 'Styleguide',
    layout: __dirname + "/views/jade/styleguide-layout.jade",
    pretty: true
  })
});

/*
 * Admin
 * Require authenticated user with property admin=true
 */
app.all('/admin*', function(req, res, next) {
  console.dir(req.user);
  console.dir(req.loggedIn);
  if (req.user.admin) {
    next();
  } else {
    res.redirect('/login');
  }
});

/* 
 * Admin landing
 */
app.get('/admin/', function(req, res) {
  res.render('admin', {
    title: 'Bitponics Admin',
    appUrl : app.config.appUrl
  })
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

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('client event', function (data) {
    console.log("GGOIJSOPIDJOPSIJDPOSDKPSODK")
    socket.broadcast.emit('sensor_event', data);
  });
});

app.listen(app.config.port, app.config.host, function(){
  console.log('Express server running at ' + app.config.appUrl);
});






/*
 * API
 */
require('./api/action')(app);
require('./api/control')(app);
require('./api/device')(app);
require('./api/growPlan')(app);
require('./api/growPlanInstance')(app);
require('./api/growSystem')(app);
require('./api/idealRange')(app);
require('./api/light')(app);
require('./api/nutrient')(app);
require('./api/phase')(app);
require('./api/sensor')(app);
require('./api/user')(app);



/**
 * Legacy POC code
 *
// Methods
var record_visit = function(req, res){
  // Connect to the DB and auth 
  mongodb.connect(mongoUrl, function(err, conn){
    conn.collection('ips', function(err, coll){
      // Simple object to insert: ip address and date 
      object_to_insert = { 'ip': req.connection.remoteAddress, 'ts': new Date() };

      // Insert the object then print in response 
      // Note the _id has been created 
      coll.insert( object_to_insert, {safe:true}, function(err){
        if(err) { console.log(err.stack); }
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write(JSON.stringify(object_to_insert));
        res.end('\n');
      });
    });
  });
}

var print_visits = function(req, res){
  // Connect to the DB and auth 
  mongodb.connect(mongoUrl, function(err, conn){
    conn.collection('ips', function(err, coll){
      coll.find({}, {limit:10, sort:[['_id','desc']]}, function(err, cursor){
        cursor.toArray(function(err, items){
          res.writeHead(200, {'Content-Type': 'text/plain'});
          for(i=0; i<items.length;i++){
            res.write(JSON.stringify(items[i]) + "\n");
          }
          res.end();
        });
      });
    });
  });
}
*/


/**
 * Device communication
 */

/*
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('sensor_event', function (data) {
    socket.broadcast.emit('sensor_event', data);
  });
});

//tcp socket server
var tcpServer = net.createServer(function (socket) {
  console.log('tcp server running on port 1337');
});

tcpServer.on('connection',function(socket){
    socket.write('connected to the tcp server\r\n');
    console.log('num of connections on port 1337: ' + tcpServer.connections);
    
    tcpGuests.push(socket);
    
    socket.on('data',function(data){
    
    console.log('received on tcp socket:', data);
        socket.write('msg received\r\n');
    socket.write(data);
    socket.write('\r\n');
    socket.write('end msg\r\n');
    
    
    try{
      var processedData = data.toString('ascii',0,data.length);
      processedData = JSON.parse(processedData);
      processedData.timestamp = new Date();
      
      require('mongodb').connect(mongoUrl, function(err, conn){
        console.log('connected to mongodb');
          conn.collection('sensor_logs', function(err, coll){
          console.log('writing to sensor_logs :', processedData);
            coll.insert( processedData, {safe:true}, function(err){
          console.log('wrote to sensor_logs');
              if(err) { console.log(err.stack); }
          conn.close();
            });
          });
        });
      
      var socks = io.sockets.sockets;
      for (s in socks) {
        if (socks[s] && socks[s].emit){
          console.log('emitting to a client');
          socks[s].emit('sensor_event', processedData); //{message:["arduino",data.toString('ascii',0,data.length)]});
        }
      }
    } catch(e){ console.log("Error parsing TCP data : ", e);}

        
        
        
    /*
    //send data to guest socket.io chat server
        for (g in io.clients) {
            var client = io.clients[g];
            client.send({message:["arduino",data.toString('ascii',0,data.length)]});
            
        }
    *//*
    })
});
*/
//tcpServer.listen(1337); 
