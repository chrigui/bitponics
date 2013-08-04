var mongooseConnection = require('../../config/mongoose-connection').open('test'),
	mongoose = require('mongoose'),
  LightBulb = require('../../models/lightBulb'),
  should = require('should'),
  moment = require('moment'),
  i18nKeys = require('../../i18n/keys');


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

describe('LightBulb', function(){

  describe(".createNewIfUserDefinedPropertiesModified", function(){

    it("creates a new LightBulb if _id isn't a valid ObjectId and name is new", function(done){
      var submittedLightBulb = {
        _id : "nonsense",
        name : "new lightBulb name"
      },
      originalSubmittedLightBulb = JSON.parse(JSON.stringify(submittedLightBulb));;

      LightBulb.model.createNewIfUserDefinedPropertiesModified(
        {
          lightBulb : submittedLightBulb
        },
        function(err, validatedLightBulb){
          should.not.exist(err);
          should.exist(validatedLightBulb);

          should.equal(validatedLightBulb.name, validatedLightBulb.name);

          done();
        }
      );
    });

    it("creates a new LightBulb if _id matches an existing LightBulb but rest of properties don't match", function(done){
      var submittedLightBulb = {
        _id : "506de3008eebf7524342cb41", 
        name : "unmatching lightBulb name"
      },
      originalSubmittedLightBulb = JSON.parse(JSON.stringify(submittedLightBulb));

      LightBulb.model.createNewIfUserDefinedPropertiesModified(
        {
          lightBulb : submittedLightBulb
        },
        function(err, validatedLightBulb){
          should.not.exist(err);
          should.exist(validatedLightBulb);

          should.equal( validatedLightBulb._id.toString() === originalSubmittedLightBulb._id.toString(), false, "_id should be new");
          validatedLightBulb.name.should.equal(originalSubmittedLightBulb.name);

          done();
        }
      );
    });

    it("returns the pre-existing LightBulb if _id and all other properties match", function(done){
      var submittedLightBulb = {
        _id : '506de3008eebf7524342cb41',
        type: "Fluorescent",
        watts: 12,
        brand : "Hydrofarm",
        name : "2-foot T5 bulb"
      },
      originalSubmittedLightBulb = JSON.parse(JSON.stringify(submittedLightBulb));

      LightBulb.model.createNewIfUserDefinedPropertiesModified(
        {
          lightBulb : submittedLightBulb
        },
        function(err, validatedLightBulb){
          should.not.exist(err);
          should.exist(validatedLightBulb);

          
          LightBulb.model.findById(validatedLightBulb._id)
          .exec(function(err, originalLightBulb){
            should.not.exist(err);
            should.exist(originalLightBulb);

            should.equal(validatedLightBulb._id.toString(), originalLightBulb._id.toString());
            should.equal(validatedLightBulb.brand, originalLightBulb.brand);
            should.equal(validatedLightBulb.name, originalLightBulb.name);
            should.equal(validatedLightBulb.type, originalLightBulb.type);
            should.equal(validatedLightBulb.watts, originalLightBulb.watts);

            done();
          });
        }
      )
    });

  }); // /.createNewIfUserDefinedPropertiesModified

});