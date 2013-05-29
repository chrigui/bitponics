var mongooseConnection = require('../../config/mongoose-connection').open('test'),
	mongoose = require('mongoose'),
  ObjectID = require('mongodb').ObjectID,
  Notification = require('../../models/notification'),
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

describe('Notification', function(){

  it('uses only friendly property names in toObject result', function(){
    var now = Date.now(),
      log = new Notification.model({
        users : [ new ObjectID() ],
        growPlanInstance : new ObjectID(),
        timeToSend : now,
        repeat : {
          repeatType : 'weeks',
          duration : 4,
          timezone : 'America/New_York'
        },
        sentLogs : [],
        type : 'actionNeeded'
      });

    var result = log.toObject();

    // only friendly 'users' should exist
    result.should.not.have.property('u');
    result.should.have.property('users');

    // only friendly 'growPlanInstance' should exist
    result.should.not.have.property('gpi');
    result.should.have.property('growPlanInstance');

    // only friendly 'timeToSend' should exist
    result.should.not.have.property('tts');
    result.should.have.property('timeToSend');

    // only friendly 'repeat' should exist
    result.should.not.have.property('r');
    result.should.have.property('repeat');

    // only friendly 'sentLogs' should exist
    result.should.not.have.property('sl');
    result.should.have.property('sentLogs');

    // only friendly 'type' should exist
    result.should.not.have.property('t');
    result.should.have.property('type');
  });

  it('uses only friendly property names in toJSON result', function(){
    var now = Date.now(),
      log = new Notification.model({
        users : [ new ObjectID() ],
        growPlanInstance : new ObjectID(),
        timeToSend : now,
        repeat : {
          repeatType : 'weeks',
          duration : 4,
          timezone : 'America/New_York'
        },
        sentLogs : [],
        type : 'actionNeeded'
      });

    var result = log.toJSON();

    // only friendly 'users' should exist
    result.should.not.have.property('u');
    result.should.have.property('users');

    // only friendly 'growPlanInstance' should exist
    result.should.not.have.property('gpi');
    result.should.have.property('growPlanInstance');

    // only friendly 'timeToSend' should exist
    result.should.not.have.property('tts');
    result.should.have.property('timeToSend');

    // only friendly 'repeat' should exist
    result.should.not.have.property('r');
    result.should.have.property('repeat');

    // only friendly 'sentLogs' should exist
    result.should.not.have.property('sl');
    result.should.have.property('sentLogs');

    // only friendly 'type' should exist
    result.should.not.have.property('t');
    result.should.have.property('type');
  });

});
