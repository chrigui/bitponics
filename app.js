
/**
 * Module dependencies.
 */

var express    = require('express'),
  Routes     = require('./routes'),
  Dashboard  = require('./routes/dashboard'),
  http       = require('http'),
  net        = require('net'),
  fs         = require('fs'),
  stylus     = require('stylus'),
  nib        = require('nib'),
  everyauth  = require('everyauth'),
  app        = module.exports = express.createServer(),
  io         = require('socket.io').listen(app),
  cache      = {},
  tcpGuests  = [],
  viewEngine = 'jade';





/**
 * Configure the app instance
 */
require('./lib/config')(app);
require('./lib/boot-mongo')(app);



app.configure('development', function(){
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
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  app.set('view options', { layout: __dirname + "/views/jade/layout-stylus.jade", pretty: true });
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.configure(function(){
  app.set('views', __dirname + '/views/' + viewEngine);
  app.set('view engine', viewEngine);
  app.use(express.logger(':method :url :status'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express['static'](__dirname + '/public'));
  
  // cookieParser and session handling are needed for everyauth (inside mongooseAuth) to work  (https://github.com/bnoguchi/everyauth/issues/27)
  app.use(express.cookieParser()); 
  app.use(express.session({ secret: 'somethingrandom'}));
  
  app.mongoose.connect(app.config.mongoUrl);
  app.use(app.mongooseAuth.middleware());
  app.mongooseAuth.helpExpress(app);

  app.dynamicHelpers({
    is_dev_mode: function (req, res) {
      return (process.env.NODE_ENV || 'development') === 'development';
    },
    css_files: function (req, res) {
      //console.log('res: ', req);
    }
  });

  // must add the router after mongoose-auth has added its middleware (https://github.com/bnoguchi/mongoose-auth)
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
    title: "Bitponics"
  });
  /*
  app.set('view options', { locals: { layout: __dirname + "/views/jade/layout-splash.jade" } });
  res.render('splash', {
    title: "Bitponics"
  });
  */
});

app.get('/signup', function(req, res) {
  res.render('signup', {
    title: "Bitponics - Sign Up"
  });
});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/dashboard', Dashboard.index);
app.get('/assistant', Dashboard.assistant);

app.listen(app.config.port, app.config.host, function(){
  console.log("Express server listening on port %d", app.address().port);
  console.log(app.config.appUrl); 
});

























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
    */
    })
});
//tcpServer.listen(1337); 
