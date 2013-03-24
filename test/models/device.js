var mongoose = require('mongoose'),
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


    describe('#refreshActiveImmediateActions', function(){
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
      
      it('appends a calibrationLog to the beginning of the array, with the current timestamp', function(done){
        var self = this;

        should.exist(self.device);
        self.device.macAddress.should.equal(self.macAddress);

        DeviceModel.logCalibration(
        {
          macAddress : self.device.macAddress,
          calibrationLog : {
            mode : "ph_4",
            status : "success"
          }
        },
        function(err, device){
          should.not.exist(err);
          should.exist(device);
          device.calibrationLogs.length.should.equal(1);
          

          DeviceModel.logCalibration(
          {
            macAddress : self.device.macAddress,
            calibrationLog : {
              mode : "ph_7",
              status : "success"
            }
          },
          function(err, device){
            should.not.exist(err);
            should.exist(device);
            device.calibrationLogs.length.should.equal(2);
            device.calibrationLogs[0].mode.should.equal("ph_7", "most recent log should be first in calibrationLogs");
            device.calibrationLogs[1].mode.should.equal("ph_4", "older log should be last in calibrationLogs");
            device.calibrationLogs[0].timestamp.valueOf().should.be.above(device.calibrationLogs[1].timestamp.valueOf(), "logs should be in descencing timestamp order");

            done();
          });
        });
      });
    });


  });