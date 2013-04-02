var mongoose = require('mongoose'),
  Light = require('../../models/light'),
  should = require('should'),
  moment = require('moment'),
  i18nKeys = require('../../i18n/keys'),
  timezone = require('timezone/loaded');


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

describe('Light', function(){

  describe(".createNewIfUserDefinedPropertiesModified", function(){

    it("creates a new Light if _id isn't a valid ObjectId and name is new", function(done){
      var submittedLight = {
        _id : "nonsense"
      },
      originalSubmittedLight = JSON.parse(JSON.stringify(submittedLight));;

      Light.model.createNewIfUserDefinedPropertiesModified(
        {
          light : submittedLight
        },
        function(err, validatedLight){
          should.not.exist(err);
          should.exist(validatedLight);

          done();
        }
      );
    });

    it("creates a new Light if _id matches an existing Light but rest of properties don't match", function(done){
      var submittedLight = {
        _id : "515a540205e45bc5a590301b", 
        fixture: {
          _id : '506de3028eebf7524342cb46',
          type: "something something"
        }
      },
      originalSubmittedLight = JSON.parse(JSON.stringify(submittedLight));

      Light.model.createNewIfUserDefinedPropertiesModified(
        {
          light : submittedLight
        },
        function(err, validatedLight){
          should.not.exist(err);
          should.exist(validatedLight);

          should.equal( validatedLight._id.toString() === originalSubmittedLight._id.toString(), false, "_id should be new");
   
          done();
        }
      );
    });

    it("returns the pre-existing Light if _id and all other properties match", function(done){
      var submittedLight = {
        _id : '515a540205e45bc5a590301b',
        fixture: {
          _id : '506de3028eebf7524342cb46',
          type: "Fluorescent",
          watts: 48,
          brand : "Hydrofarm",
          name : "T5 2-tube 2-foot System",
          bulbCapacity : 4
        },
        fixtureQuantity : 1,
        bulb : {
          _id : '506de3008eebf7524342cb41',
          type: "Fluorescent",
          watts: 12,
          brand : "Hydrofarm",
          name : "2-foot T5 bulb"
        }
      },
      originalSubmittedLight = JSON.parse(JSON.stringify(submittedLight));

      Light.model.createNewIfUserDefinedPropertiesModified(
        {
          light : submittedLight
        },
        function(err, validatedLight){
          should.not.exist(err);
          should.exist(validatedLight);

          
          Light.model.findById(validatedLight._id)
          .exec(function(err, originalLight){
            should.not.exist(err);
            should.exist(originalLight);

            should.equal(validatedLight._id.toString(), originalLight._id.toString());
            should.equal(validatedLight.fixture.toString(), originalLight.fixture.toString());
            should.equal(validatedLight.bulb.toString(), originalLight.bulb.toString());
            should.equal(validatedLight.fixtureQuantity, originalLight.fixtureQuantity);
    

            done();
          });
        }
      )
    });

  }); // /.createNewIfUserDefinedPropertiesModified

});