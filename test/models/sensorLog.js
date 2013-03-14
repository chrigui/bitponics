var mongoose = require('mongoose'),
  SensorLog = require('../../models/sensorLog'),
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

describe('SensorLog', function(){

  it('uses only friendly property names in toObject result', function(){
    var sensorLog = new SensorLog.model({
      ts : Date.now(),
      logs : [
        {
          sCode : 'vis',
          val : 1234
        }
      ]
    });

    var result = sensorLog.toObject();

    // only friendly 'logs' should exist
    result.should.not.have.property('l');
    result.should.have.property('logs');

    // only friendly 'timestamp' should exist
    result.should.not.have.property('ts');
    result.should.have.property('timestamp');

    result.logs.forEach(function(log){
      log.should.not.have.property('s');
      log.should.not.have.property('v');
      log.should.have.property('sCode');
      log.should.have.property('val');
    });

  });

  it('uses only friendly property names in toJSON result', function(){
    var sensorLog = new SensorLog.model({
      ts : Date.now(),
      logs : [
        {
          sCode : 'vis',
          val : 1234
        }
      ]
    });

    var result = sensorLog.toJSON();

    // only friendly 'logs' should exist
    result.should.not.have.property('l');
    result.should.have.property('logs');

    // only friendly 'timestamp' should exist
    result.should.not.have.property('ts');
    result.should.have.property('timestamp');

    result.logs.forEach(function(log){
      log.should.not.have.property('s');
      log.should.not.have.property('v');
      log.should.have.property('sCode');
      log.should.have.property('val');
    });

  });

});
