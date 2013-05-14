var DeviceModel = require('../models/device').model,
    CalibrationLogModel = require('../models/calibrationLog').model,
    UserModel = require('../models/user').model;

module.exports = function(app){
  
  app.socketIOs.forEach(function(io){
    
    io
    .of('/calibrate')
    .on('connection', function(socket){
      var session = socket.handshake.session,
          userId = session.passport.user,
          checkIntervalId;

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
    }); // /./calibrate

    
    io
    .of('/setup')
    .on('connection', function(socket){
      console.log("connected");
      var session = socket.handshake.session,
          userId = session.passport.user,
          checkIntervalId;

      socket.on('disconnect', function () {
        clearInterval(checkIntervalId);
      });

      socket.on('ready', function (data) {
        console.log("ready");
        var serial = data.serial,
            started = Date.now();

        if (!serial) { return; }

        clearInterval(checkIntervalId);
        
        checkIntervalId = setInterval(function(){
          
          UserModel.findById(userId)
          .exec(function (err, user){
            if (err || !user) { return; }
            socket.emit(
              'keys', 
              user.deviceKeys
            );
          });
        }, 5 * 1000);
      });
    }); // /./setup    

  });
};