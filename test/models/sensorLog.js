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
    should.not.exist(result.l);
    should.exist(result.logs);

    // only friendly 'timestamp' should exist
    should.not.exist(result.ts);
    should.exist(result.timestamp);

    result.logs.forEach(function(log){
      should.not.exist(log.s);
      should.not.exist(log.v);
      should.exist(log.sCode);
      should.exist(log.val);
    })

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
    should.not.exist(result.l);
    should.exist(result.logs);

    // only friendly 'timestamp' should exist
    should.not.exist(result.ts);
    should.exist(result.timestamp);

    result.logs.forEach(function(log){
      should.not.exist(log.s);
      should.not.exist(log.v);
      should.exist(log.sCode);
      should.exist(log.val);
    })
  });

});
