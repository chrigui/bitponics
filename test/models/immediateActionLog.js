var mongoose = require('mongoose'),
  ObjectID = require('mongodb').ObjectID,
  ImmediateAction = require('../../models/immediateAction'),
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

describe('ImmediateAction', function(){

  it('uses only friendly property names in toObject result', function(){
    var now = Date.now(),
      log = new ImmediateAction.model({
        growPlanInstance : new ObjectID(),
        message : 'message',
        timeRequested : now,
        timeSent : now,
        expires : now,
        action : new ObjectID(),
        done : true
      });

    var result = log.toObject();

    // only friendly 'growPlanInstance' should exist
    result.should.not.have.property('gpi');
    result.should.have.property('growPlanInstance');

    // only friendly 'message' should exist
    result.should.not.have.property('m');
    result.should.have.property('message');

    // only friendly 'timeRequested' should exist
    result.should.not.have.property('r');
    result.should.have.property('timeRequested');

    // only friendly 'timeSent' should exist
    result.should.not.have.property('ts');
    result.should.have.property('timeSent');

    // only friendly 'expires' should exist
    result.should.not.have.property('e');
    result.should.have.property('expires');

    // only friendly 'action' should exist
    result.should.not.have.property('a');
    result.should.have.property('action');

    // only friendly 'done' should exist
    result.should.not.have.property('d');
    result.should.have.property('done');

  });

  it('uses only friendly property names in toJSON result', function(){
    var now = Date.now(),
      log = new ImmediateAction.model({
        growPlanInstance : new ObjectID(),
        message : 'message',
        timeRequested : now,
        timeSent : now,
        expires : now,
        action : new ObjectID(),
        done : true
      });

    var result = log.toJSON();

    // only friendly 'growPlanInstance' should exist
    result.should.not.have.property('gpi');
    result.should.have.property('growPlanInstance');

    // only friendly 'message' should exist
    result.should.not.have.property('m');
    result.should.have.property('message');

    // only friendly 'timeRequested' should exist
    result.should.not.have.property('r');
    result.should.have.property('timeRequested');

    // only friendly 'timeSent' should exist
    result.should.not.have.property('ts');
    result.should.have.property('timeSent');

    // only friendly 'expires' should exist
    result.should.not.have.property('e');
    result.should.have.property('expires');

    // only friendly 'action' should exist
    result.should.not.have.property('a');
    result.should.have.property('action');

    // only friendly 'done' should exist
    result.should.not.have.property('d');
    result.should.have.property('done');

  });

});
