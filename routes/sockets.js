module.exports = function(app){
  
  app.socketIOs.forEach(function(io){
    
    io
    .of('/calibrate')
    .on('connection', function(socket){
      var session = socket.handshake.session;
      socket.on('client event', function (data) {
        console.log("GGOIJSOPIDJOPSIJDPOSDKPSODK")
        socket.broadcast.emit('sensor_event', data);
        socket.emit('news', { one : 'love'});

        console.log(session);

        session.lastUpdatedMe = Date.now();
      });
    });  
  });
};