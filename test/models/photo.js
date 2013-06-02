var mongooseConnection = require('../../config/mongoose-connection').open('test'),
	mongoose = require('mongoose'),
  ObjectID = require('mongodb').ObjectID,
  PhotoModel = require('../../models/photo').model,
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

describe('Photo', function(){

  it('uses only friendly property names in toObject result', function(){
    var log = new PhotoModel({
      gpi : new ObjectID(),
      tags: ["seedling", "tomato"]
    });

    var result = log.toObject();

    // only friendly 'timestamp' should exist
    result.should.not.have.property('ts');
    result.should.have.property('tags');
    result.tags.should.include("seedling")
    result.tags.should.include("tomato")
  });

  it('uses only friendly property names in toJSON result', function(){
    var log = new PhotoModel({
      gpi : new ObjectID(),
      tags: ["seedling", "tomato"]
    });

    var result = log.toJSON();

    // only friendly 'timestamp' should exist
    result.should.not.have.property('ts');
    result.should.have.property('tags');
    result.tags.should.include("seedling")
    result.tags.should.include("tomato")
  });

});
