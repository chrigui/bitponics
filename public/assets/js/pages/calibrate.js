$(function(){
var socket = io.connect('https://bitponics.com');
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });
  socket.on('sensor_event', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });

  $('#calibrate-ph4').click(function(e){
    socket.emit('client event', { my: 'data' });
  });
});