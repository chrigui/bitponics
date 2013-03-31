var DeviceModel = require('../models/device').model,
    CalibrationLogModel = require('../models/calibrationLog').model;

module.exports = function(app){
  
  app.socketIOs.forEach(function(io){
    
    io
    .of('/calibrate')
    .on('connection', function(socket){
      var session = socket.handshake.session,
          userId = session.passport.user,
          checkIntervalId

      socket.on('disconnect', function () {
        clearInterval(checkIntervalId);
      });

      socket.on('ready', function (data) {
        var deviceId = data.deviceId,
            mode = data.mode,
            started = Date.now();

        if (!deviceId) { return; }

        DeviceModel.update({_id : deviceId }, { "status.calibrationMode" : mode }).exec();
        
        clearInterval(checkIntervalId);
        
        checkIntervalId = setInterval(function(){
          
          CalibrationLogModel.find({
            d : deviceId,
            ts : { $gt : started },
            m : mode
          })
          .sort('-ts')
          .exec(function (err, calibrationLogResults){
            if (err || (!(calibrationLogResults && calibrationLogResults.length))) { return; }
            console.log('recent calib logs', calibrationLogResults);
            socket.emit(
              'device_calibration_response', 
              calibrationLogResults[0]
            );
          });
        }, 5 * 1000);
      });
    });  
  });
};