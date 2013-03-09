var mongoose = require('mongoose'),
  ObjectID = require('mongodb').ObjectID,
  TagLog = require('../models/tagLog'),
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

describe('TagLog', function(){

  it('uses only friendly property names in toObject result', function(){
    var log = new TagLog.model({
      gpi : new ObjectID(),
      ts : Date.now(),
      logs : [
        {
          val : "my garden journal entry",
          tags: ["journal"]
        }
      ]
    });

    var result = log.toObject();

    // only friendly 'logs' should exist
    should.not.exist(result.l);
    should.exist(result.logs);

    // only friendly 'timestamp' should exist
    should.not.exist(result.ts);
    should.exist(result.timestamp);

    result.logs.forEach(function(log){
      should.not.exist(log.v);
      should.not.exist(log.t);
      should.exist(log.val);
      should.exist(log.tags);
      log.tags.should.include("journal");
    });

  });

  it('uses only friendly property names in toJSON result', function(){
    var log = new TagLog.model({
      gpi : new ObjectID(),
      ts : Date.now(),
      logs : [
        {
          val : "my garden journal entry",
          tags: ["journal"]
        }
      ]
    });

    var result = log.toJSON();

    // only friendly 'logs' should exist
    should.not.exist(result.l);
    should.exist(result.logs);

    // only friendly 'timestamp' should exist
    should.not.exist(result.ts);
    should.exist(result.timestamp);

    result.logs.forEach(function(log){
      should.not.exist(log.v);
      should.not.exist(log.t);
      should.exist(log.val);
      should.exist(log.tags);
      log.tags.should.include("journal");
    });


  });

});
