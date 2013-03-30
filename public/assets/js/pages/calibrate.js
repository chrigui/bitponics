$(function(){
var socket = io.connect('/calibrate');
  
  socket.on('connect', function () {
    console.log('connected');
    socket.emit('ready', { deviceId: bpn.pages.calibrate.deviceId });
  });
  
  socket.on('device_calibration_response', function (data) {
    console.log('device_calibration_response', data);
  });

  socket.on('error', function(err){
    console.log('error establishing socket connection', err);
  });

  $('#calibrate-ph4').click(function(e){
    socket.emit('client event', { my: 'data' });
  });

});