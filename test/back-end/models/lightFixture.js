var mongooseConnection = require('../../../config/mongoose-connection').open('test'),
	mongoose = require('mongoose'),
  LightFixture = require('../../../models/lightFixture'),
  should = require('should'),
  moment = require('moment'),
  i18nKeys = require('../../../i18n/keys');


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

describe('LightFixture', function(){

  describe(".createNewIfUserDefinedPropertiesModified", function(){

    it("creates a new LightFixture if _id isn't a valid ObjectId and name is new", function(done){
      var submittedLightFixture = {
        _id : "nonsense",
        name : "new lightFixture name"
      },
      originalSubmittedLightFixture = JSON.parse(JSON.stringify(submittedLightFixture));;

      LightFixture.model.createNewIfUserDefinedPropertiesModified(
        {
          lightFixture : submittedLightFixture
        },
        function(err, validatedLightFixture){
          should.not.exist(err);
          should.exist(validatedLightFixture);

          should.equal(validatedLightFixture.name, validatedLightFixture.name);

          done();
        }
      );
    });

    it("creates a new LightFixture if _id matches an existing LightFixture but rest of properties don't match", function(done){
      var submittedLightFixture = {
        _id : "506de3028eebf7524342cb46", 
        name : "unmatching lightFixture name"
      },
      originalSubmittedLightFixture = JSON.parse(JSON.stringify(submittedLightFixture));

      LightFixture.model.createNewIfUserDefinedPropertiesModified(
        {
          lightFixture : submittedLightFixture
        },
        function(err, validatedLightFixture){
          should.not.exist(err);
          should.exist(validatedLightFixture);

          should.equal( validatedLightFixture._id.toString() === originalSubmittedLightFixture._id.toString(), false, "_id should be new");
          validatedLightFixture.name.should.equal(originalSubmittedLightFixture.name);

          done();
        }
      );
    });

    it("returns the pre-existing LightFixture if _id and all other properties match", function(done){
      var submittedLightFixture = {
        _id : '506de3028eebf7524342cb46',
        type: "Fluorescent",
        watts: 48,
        brand : "Hydrofarm",
        name : "T5 2-tube 2-foot System",
        bulbCapacity : 4
      },
      originalSubmittedLightFixture = JSON.parse(JSON.stringify(submittedLightFixture));

      LightFixture.model.createNewIfUserDefinedPropertiesModified(
        {
          lightFixture : submittedLightFixture
        },
        function(err, validatedLightFixture){
          should.not.exist(err);
          should.exist(validatedLightFixture);

          
          LightFixture.model.findById(validatedLightFixture._id)
          .exec(function(err, originalLightFixture){
            should.not.exist(err);
            should.exist(originalLightFixture);

            should.equal(validatedLightFixture._id.toString(), originalLightFixture._id.toString());
            should.equal(validatedLightFixture.brand, originalLightFixture.brand);
            should.equal(validatedLightFixture.name, originalLightFixture.name);
            should.equal(validatedLightFixture.type, originalLightFixture.type);
            should.equal(validatedLightFixture.watts, originalLightFixture.watts);
            should.equal(validatedLightFixture.bulbCapacity, originalLightFixture.bulbCapacity);

            done();
          });
        }
      )
    });

  }); // /.createNewIfUserDefinedPropertiesModified

});