var DeviceModel = require('../models/device').model;

module.exports = function(app){
  
  app.socketIOs.forEach(function(io){
    
    io
    .of('/calibrate')
    .on('connection', function(socket){
      var session = socket.handshake.session,
          checkIntervalId

      socket.on('disconnect', function () {
        clearInterval(checkIntervalId);
      });

      socket.on('ready', function (data) {
        var deviceId = data.deviceId,
            started = Date.now();
        if (!deviceId) { return; }


        checkIntervalId = setInterval(function () {
          console.log("checking device calib", deviceId);
          DeviceModel.findById(deviceId, function(err, deviceResult){
            if (err || !deviceResult) { return; }
            console.log('current calib logs', deviceResult.calibrationLogs);
            if (deviceResult.calibrationLogs[0] && deviceResult.calibrationLogs[0].timestamp.valueOf() > started){
              console.log('cool! sending');
              socket.emit(
                'device_calibration_response', 
                deviceResult.calibrationLogs[0]
              );
            }
            
          });
          
        }, 5 * 1000);

        console.log(session);
        console.log(session.passport.user);

        session.lastUpdatedMe = Date.now();
      });
    });  
  });
};