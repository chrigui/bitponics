var mongoose = require('mongoose'),
  ObjectID = require('mongodb').ObjectID,
  ImmediateActionLog = require('../models/immediateActionLog'),
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

describe('ImmediateActionLog', function(){

  it('uses only friendly property names in toObject result', function(){
    var now = Date.now(),
      log = new ImmediateActionLog.model({
        growPlanInstance : new ObjectID(),
        msg : 'msg',
        timeRequested : now,
        timeSent : now,
        expires : now,
        action : new ObjectID(),
        done : true
      });

    var result = log.toObject();

    // only friendly 'growPlanInstance' should exist
    should.not.exist(result.gpi);
    should.exist(result.growPlanInstance);

    // only friendly 'timeRequested' should exist
    should.not.exist(result.tr);
    should.exist(result.timeRequested);

    // only friendly 'timeSent' should exist
    should.not.exist(result.ts);
    should.exist(result.timeSent);

    // only friendly 'expires' should exist
    should.not.exist(result.e);
    should.exist(result.expires);

    // only friendly 'action' should exist
    should.not.exist(result.a);
    should.exist(result.action);

    // only friendly 'done' should exist
    should.not.exist(result.d);
    should.exist(result.done);

  });

  it('uses only friendly property names in toJSON result', function(){
    var now = Date.now(),
      log = new ImmediateActionLog.model({
        growPlanInstance : new ObjectID(),
        msg : 'msg',
        timeRequested : now,
        timeSent : now,
        expires : now,
        action : new ObjectID(),
        done : true
      });

    var result = log.toJSON();

    // only friendly 'growPlanInstance' should exist
    should.not.exist(result.gpi);
    should.exist(result.growPlanInstance);

    // only friendly 'timeRequested' should exist
    should.not.exist(result.tr);
    should.exist(result.timeRequested);

    // only friendly 'timeSent' should exist
    should.not.exist(result.ts);
    should.exist(result.timeSent);

    // only friendly 'expires' should exist
    should.not.exist(result.e);
    should.exist(result.expires);

    // only friendly 'action' should exist
    should.not.exist(result.a);
    should.exist(result.action);

    // only friendly 'done' should exist
    should.not.exist(result.d);
    should.exist(result.done);


  });

});
