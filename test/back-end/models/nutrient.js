var mongooseConnection = require('../../../config/mongoose-connection').open('test'),
	mongoose = require('mongoose'),
  Nutrient = require('../../../models/nutrient'),
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

describe('Nutrient', function(){

  describe(".createNewIfUserDefinedPropertiesModified", function(){

    it("creates a new Nutrient if _id isn't a valid ObjectId and name is new", function(done){
      var submittedNutrient = {
        _id : "nonsense",
        name : "new nutrient name"
      },
      originalSubmittedNutrient = JSON.parse(JSON.stringify(submittedNutrient));;

      Nutrient.model.createNewIfUserDefinedPropertiesModified(
        {
          nutrient : submittedNutrient
        },
        function(err, validatedNutrient){
          should.not.exist(err);
          should.exist(validatedNutrient);

          should.equal(validatedNutrient.name, validatedNutrient.name);

          done();
        }
      );
    });

    it("creates a new Nutrient if _id matches an existing Nutrient but rest of properties don't match", function(done){
      var submittedNutrient = {
        _id : "506de3038eebf7524342cb4b", 
        name : "unmatching nutrient name"
      },
      originalSubmittedNutrient = JSON.parse(JSON.stringify(submittedNutrient));

      Nutrient.model.createNewIfUserDefinedPropertiesModified(
        {
          nutrient : submittedNutrient
        },
        function(err, validatedNutrient){
          should.not.exist(err);
          should.exist(validatedNutrient);

          should.equal( validatedNutrient._id.toString() === originalSubmittedNutrient._id.toString(), false, "_id should be new");
          validatedNutrient.name.should.equal(originalSubmittedNutrient.name);

          done();
        }
      );
    });

    it("returns the pre-existing Nutrient if _id and all other properties match", function(done){
      var submittedNutrient = {
        _id : '506de3038eebf7524342cb4b',
        brand: "Humbolt Nutrients",
        name: "Grow"
      },
      originalSubmittedNutrient = JSON.parse(JSON.stringify(submittedNutrient));

      Nutrient.model.createNewIfUserDefinedPropertiesModified(
        {
          nutrient : submittedNutrient
        },
        function(err, validatedNutrient){
          should.not.exist(err);
          should.exist(validatedNutrient);

          
          Nutrient.model.findById(validatedNutrient._id)
          .exec(function(err, originalNutrient){
            should.not.exist(err);
            should.exist(originalNutrient);

            should.equal(validatedNutrient._id.toString(), originalNutrient._id.toString());
            should.equal(validatedNutrient.brand, originalNutrient.brand);
            should.equal(validatedNutrient.name, originalNutrient.name);

            done();
          });
        }
      )
    });

  }); // /.createNewIfUserDefinedPropertiesModified

});