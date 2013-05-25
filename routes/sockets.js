var DeviceModel = require('../models/device').model,
    CalibrationStatusLogModel = require('../models/calibrationStatusLog').model,
    CalibrationLogModel = require('../models/calibrationLog').model,
    UserModel = require('../models/user').model,
    requirejs = require('../lib/requirejs-wrapper'),
    feBeUtils = requirejs('fe-be-utils'),
    async = require('async'),
    winston = require('winston');

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
            started = Date.now(),
            type;

        if (!deviceId) { return; }

        clearInterval(checkIntervalId);

        switch (mode) {
          case feBeUtils.CALIB_MODES["PH_4"] :
          case feBeUtils.CALIB_MODES["PH_7"] :
          case feBeUtils.CALIB_MODES["PH_10"] :
          case feBeUtils.CALIB_MODES["EC_DRY"] :
          case feBeUtils.CALIB_MODES["EC_LO"] :
          case feBeUtils.CALIB_MODES["EC_HI"] :
            DeviceModel.update({_id : deviceId }, { "status.calibrationMode" : mode }).exec();            

            checkIntervalId = setInterval(function(){
              CalibrationStatusLogModel.find({
                d : deviceId,
                ts : { $gt : started },
                m : mode
              })
              .sort('-ts')
              .exec(function (err, calibrationStatusLogResults){
                if (err || (!(calibrationStatusLogResults && calibrationStatusLogResults.length))) { return; }
                console.log('recent calib logs', calibrationStatusLogResults);
                socket.emit(
                  'device_calibration_response', 
                  calibrationStatusLogResults[0]
                );
              });
            }, 5 * 1000);
            break;
          
          default:
            // if not one of those, assume it was a "done" message.
            DeviceModel.update({_id : deviceId }, { "status.calibrationMode" : null }).exec();
            
            switch (mode){
              case feBeUtils.CALIB_MODES["PH_DONE"] :
                type = feBeUtils.CALIB_LOG_TYPES.PH;
                break;
              case feBeUtils.CALIB_MODES["EC_DONE"] :
                type = feBeUtils.CALIB_LOG_TYPES.EC;
                break;
            }

            if (type){
              CalibrationLogModel.create({
                device : deviceId,
                timestamp : Date.now(),
                type : type
              },
              function(err, newCalibrationLog){
                // not going to do anything just yet. because I don't yet know what to do.
                if (err) { winston.error(err);}
              });  
            }
        }
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