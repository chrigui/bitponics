
/**
 * Module dependencies.
 */

var express    = require('express'),
    app        = module.exports = express(),
    server     = require('http').createServer(app),
    io         = require('socket.io').listen(server),
    winston    = require('winston');

// Configure the app instance
require('./config')(app, io);

// Add Routes to the app
require('./routes')(app);

/** 
 *  Error handling 
 *  Should be done last after all routes & middleware
 *  References:
 *  http://expressjs.com/guide.html
 */
require('./config/error-config')(app);


// Finally, start up the server
server.listen(process.env.PORT || 80, function(){
  //var address = server.address();
  //app.config.appUrl = 'http://' + address.address + (address.port == 80 ? '' : ':' + address.port);
  
  winston.info('Express server running at ' + JSON.stringify(server.address()));
  winston.info('app.config.appUrl = ' + app.config.appUrl);
});

if (app.settings.env === 'local'){
  var fs = require('fs'),
      https = require('https');
      

  var options = {
    key: fs.readFileSync('config/ssl/local/server.key'),
    cert: fs.readFileSync('config/ssl/local/server.crt')
  };
  var httpsServer = https.createServer(options, app);
  var httpsIO = require('socket.io').listen(httpsServer);


  // Duplicating the code from app-config.js for the standard socket
  httpsIO.set('authorization', function (handshakeData, accept) {
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

  httpsServer.listen(443, function(){
    winston.info('started https server');
  });
}



/*
 * socket.io code
 */
var onConnection = function (socket) {
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

  socket.on('client event', function (data) {
    console.log("GGOIJSOPIDJOPSIJDPOSDKPSODK")
    socket.broadcast.emit('sensor_event', data);
    socket.emit('news', { one : 'love'});

    console.log(session);

    session.lastUpdatedMe = Date.now();
  });
};

io.sockets.on('connection', onConnection);
httpsIO.sockets.on('connection', onConnection);

/*

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
