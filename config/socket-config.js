/**
 * Dependent on app.config.session
 */

//var SocketMongoStore = require('../lib/mong.socket.io-wrapper');
var passportSocketIo = require("passport.socketio"),
    express = require('express');

module.exports = function(app){
  
  app.socketIOs.forEach(function(io){
    
    io.configure(function () {
      io.set("log level", 3);
    });


    io.configure('staging', function(){
      io.enable('browser client minification');  // send minified client
      io.enable('browser client etag');          // apply etag caching logic based on version number
      io.enable('browser client gzip');          // gzip the file
      io.set('log level', 1);
    });

    io.configure('production', function(){
      io.enable('browser client minification');  // send minified client
      io.enable('browser client etag');          // apply etag caching logic based on version number
      io.enable('browser client gzip');          // gzip the file
      io.set('log level', 1);
    });


    // Make socket.io handlers aware of user sessions
    // http://stackoverflow.com/questions/13095418/how-to-use-passport-with-express-and-socket-io
    // http://howtonode.org/socket-io-auth
    // http://www.danielbaulig.de/socket-ioexpress/
    // Just attach the session if found, don't reject the handshake.
    // Make individual session routes/namespaces ensure auth'ed user when necessary
    io.set('authorization', passportSocketIo.authorize({
      cookieParser: express.cookieParser,
      key:         app.config.session.key,
      secret:      app.config.session.secret,
      store:       app.config.session.store
    }));

    
    // /**
    //  * Global onConnection handler. Do 
    //  * these things for all socket connections
    //  */
    // io.sockets.on('connection', function (socket) {
    //   var session = socket.handshake.session;
    //   // setup an inteval that will keep the session fresh
    //   var sessionRefreshIntervalId = setInterval(function () {
    //       // reload the session (just in case something changed,
    //       // we don't want to override anything, but the age)
    //       // reloading will also ensure we keep an up2date copy
    //       // of the session with our connection.
    //       session.reload( function () { 
    //         // "touch" it (resetting maxAge and lastAccess)
    //         // and save it back again.
    //         session.touch().save();
    //       });
    //   }, 5 * 1000);

    //   socket.on('disconnect', function () {
    //     winston.info('A socket with sessionId ' + socket.handshake.sessionID
    //         + ' disconnected!');
    //     // clear the socket interval to stop refreshing the session
    //     clearInterval(sessionRefreshIntervalId);
    //   });

    // });


  });  
}
    