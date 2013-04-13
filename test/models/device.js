var mongooseConnection = require('../../config/mongoose-connection').open('test'),
mongoose = require('mongoose'),
ObjectID = require('mongodb').ObjectID,
Models = require('../../models'),
Device = require('../../models/device'),
DeviceModel = Device.model,
ModelUtils = Models.utils,
should = require('should');


/*
 * Mocha Test
 *
 * Tests are organized by having a "describe" and "it" method. Describe
 * basically creates a "section" that you are testing and the "it" method
 * is what runs your test code.
 *
 * For asynchronous tests you need to have a done method that you call after
 * your code should be done executing so Mocha runs to test properly.
 */
 describe('Device', function(){
 	
  /*
   * beforeEach Method
   *
	 * Run before each test.
	 */
	 beforeEach(function(done){
	 	done();
	 });


   /*
    * afterEach method
    *
    * Run after each test.
    * Remove the test user.
    */
    afterEach(function(done){
    	done();
    });


    describe('#refreshStatus', function(){
      beforeEach(function(done){
        done();        
      });

      afterEach(function(done){
        done();
      });
      
    });


    describe('.logCalibration', function(){
      
      beforeEach(function(done){
        var self = this;
        self.macAddress = "101010101010";

        DeviceModel.create({
          macAddress: self.macAddress
        }, 
        function(err, createdDevice){
          self.device = createdDevice;
          done();
        });
      });

      afterEach(function(done){
        DeviceModel.remove({macAddress: this.macAddress}, done);
      });
      
      it('logs a calibration log, with the current timestamp', function(done){
        var self = this,
            now = Date.now();

        should.exist(self.device);
        self.device.macAddress.should.equal(self.macAddress);

        DeviceModel.logCalibration(
        {
          macAddress : self.device.macAddress,
          calibrationLog : {
            mode : "ph_4",
            status : "success",
            message : "calibration message"
          }
        },
        function(err, calibrationLog){
          should.not.exist(err);
          should.exist(calibrationLog);
          
          calibrationLog.mode.should.equal("ph_4");
          calibrationLog.status.should.equal("success");
          calibrationLog.message.should.equal("calibration message");
          calibrationLog.timestamp.valueOf().should.be.above(now);
          
          done();
        });
      });
    });


  });