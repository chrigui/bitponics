var mongoose = require('mongoose'),
  ObjectID = require('mongodb').ObjectID,
  HarvestLog = require('../models/harvestLog'),
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

describe('HarvestLog', function(){

  it('uses only friendly property names in toObject result', function(){
    var log = new HarvestLog.model({
      gpi : new ObjectID(),
      ts : Date.now(),
      logs : [
        {
          plant : "50749839ab364e2a9fffd4f0", // dill
          weight : 10 // grams
        }
      ]
    });

    var result = log.toObject();
    should.not.exist(result.l)
    should.exist(result.logs);

    result.logs.forEach(function(log){
      should.not.exist(log.p);
      should.not.exist(log.w);
      should.exist(log.plant);
      should.exist(log.weight);
    });

  });

  it('uses only friendly property names in toJSON result', function(){
    var log = new HarvestLog.model({
      gpi : new ObjectID(),
      ts : Date.now(),
      logs : [
        {
          plant : "50749839ab364e2a9fffd4f0", // dill
          weight : 10 // grams
        }
      ]
    });

    var result = log.toJSON();
    should.not.exist(result.l)
    should.exist(result.logs);

    result.logs.forEach(function(log){
      should.not.exist(log.p);
      should.not.exist(log.w);
      should.exist(log.plant);
      should.exist(log.weight);
    });
  });

});
