var DeviceModel = require('../models/device').model,
    CalibrationStatusLogModel = require('../models/calibrationStatusLog').model,
    CalibrationLogModel = require('../models/calibrationLog').model,
    GrowPlanInstanceModel = require('../models/growPlanInstance').model,
    SensorLogModel = require('../models/sensorLog').model,
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
            DeviceModel.update({_id : deviceId }, { $unset : { "status.calibrationMode" : 1 } }).exec();
            
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
    }); // /calibrate

  


    io
    .of('/setup')
    .on('connection', function(socket){
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
          .select('deviceKeys')
          .exec(function (err, user){
            if (err || !user) { return; }
            socket.emit(
              'keys',
              user.deviceKeys
            );
          });
        }, 5 * 1000);
      });
    }); // /setup    



    /**
     * Socket for monitoring latest grow plan instance data
     * - sensor logs
     * - device status
     *
     * Does not send repeat data, only updates since the last time 
     * data were sent.
     */
    io
    .of('/latest-grow-plan-instance-data')
    .on('connection', function(socket){
      var session = socket.handshake.session,
          userId = session.passport.user,
          checkIntervalId;

      socket.on('disconnect', function () {
        clearInterval(checkIntervalId);
      });

      socket.on('ready', function (data) {
        var growPlanInstanceId = data.growPlanInstanceId,
            started = new Date(),
            lastSent = started;

        if (!growPlanInstanceId) { return; }

        // before we set up the interval, 
        // make sure the user has permission on the GPI

        async.parallel(
          [
            function getGPI(innerCallback){
              GrowPlanInstanceModel.findById(growPlanInstanceId)
              .select('owner users visibility device')
              .exec(innerCallback);
            },
            function getUser(innerCallback){
              UserModel.findById(userId)
              .select('admin')
              .exec(innerCallback);
            }
          ],
          function(err, results){
            if (err) { return handleSocketError(err); }

            var growPlanInstance = results[0],
                user = results[1];

            if (!growPlanInstance ){ return; }
            if ( (growPlanInstance.visibility === feBeUtils.VISIBILITY_OPTIONS.PRIVATE) && 
               !growPlanInstance.owner.equals(user._id) &&
               (!user && !user.admin)
            ){
              return;
            }

            // if we've gotten here, we're good
            clearInterval(checkIntervalId);
        
            checkIntervalId = setInterval(function(){
              async.parallel(
                [
                  function getSensorLogs(innerCallback){
                    SensorLogModel.find({
                      gpi : growPlanInstanceId,
                      ts : { $gte : lastSent }
                    })
                    .limit(1)
                    .exec(innerCallback);
                  },
                  function getDeviceStatus(innerCallback){
                    // TODO 
                    return innerCallback();
                  }
                ],
                function parallelFinal(err, results){
                  if (err) { return handleSocketError(err); }

                  var sensorLog = results[0][0],
                      device = results[1];

                  if (sensorLog){
                    socket.emit(
                      'update',
                      {
                        sensorLog : sensorLog
                      }
                    );
                  }

                  lastSent = new Date();
                }
              );

            }, 10 * 1000);
          }
        );
        
        
      });
    }); // /latest-grow-plan-instance-data



  }); // /app.socketIOs.forEach(function(io){


  function handleSocketError(err){
    winston.info("SOCKET ERROR", err);
    return;
  }
};