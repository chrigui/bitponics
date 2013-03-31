define([
    'socket.io',
    'es5shim',
    'steps',
    'moment',
    'fe-be-utils'
    ],
function(io){
  var socket = io.connect('/calibrate'),
      waitingOn = '',
      $overlay = $('#overlay');
  
  socket.on('connect', function () {
    console.log('connected');
    //socket.emit('ready', { deviceId: bpn.pages.calibrate.deviceId });
  });
  
  socket.on('device_calibration_response', function (data) {
    console.log('device_calibration_response', data);
    switch(data.mode){
      case bpn.utils.CALIB_MODES.PH_4:
        $overlay.hide();
        $('.step').removeClass('active');
        $('.step').eq(1).addClass('active');
        break;
      case bpn.utils.CALIB_MODES.PH_7:
        $overlay.hide();
        $('.step').removeClass('active');
        $('.step').eq(2).addClass('active');
        break;
      case bpn.utils.CALIB_MODES.PH_10:
        $overlay.hide();
        $('.step').removeClass('active');
        $('.step').eq(3).addClass('active');
        break;
    }
  });

  socket.on('error', function(err){
    console.log('error establishing socket connection', err);
  });

  $('#calibrate-ph4').click(function(e){
    waitingOn = bpn.utils.CALIB_MODES.PH_4;
    socket.emit('ready', { deviceId: bpn.pages.calibrate.deviceId, mode: waitingOn });
    $overlay.html("<h1>Calibrating pH 4...</h1>").show();
  });

  $('#calibrate-ph7').click(function(e){
    waitingOn = bpn.utils.CALIB_MODES.PH_7;
    socket.emit('ready', { deviceId: bpn.pages.calibrate.deviceId, mode: waitingOn });
    $overlay.html("<h1>Calibrating pH 7...</h1>").show();
  });

  $('#calibrate-ph10').click(function(e){
    waitingOn = bpn.utils.CALIB_MODES.PH_10;
    socket.emit('ready', { deviceId: bpn.pages.calibrate.deviceId, mode: waitingOn });
    $overlay.html("<h1>Calibrating pH 10...</h1>").show();
  });
});
