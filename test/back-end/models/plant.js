var mongooseConnection = require('../../../config/mongoose-connection').open('test'),
	mongoose = require('mongoose'),
  Plant = require('../../../models/plant'),
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

describe('Plant', function(){

  describe(".createNewIfUserDefinedPropertiesModified", function(){

    it("creates a new Plant if _id isn't a valid ObjectId and name is new", function(done){
      var submittedPlant = {
        _id : "nonsense",
        name : "new plant name"
      },
      originalSubmittedPlant = JSON.parse(JSON.stringify(submittedPlant));;

      Plant.model.createNewIfUserDefinedPropertiesModified(
        {
          plant : submittedPlant
        },
        function(err, validatedPlant){
          should.not.exist(err);
          should.exist(validatedPlant);

          should.equal(validatedPlant.name, validatedPlant.name);

          done();
        }
      );
    });

    it("creates a new Plant if _id matches an existing Plant but rest of properties don't match", function(done){
      var submittedPlant = {
        _id : "50749839ab364e2a9fffd4ef", // Lemon
        name : "unmatching plant name"
      },
      originalSubmittedPlant = JSON.parse(JSON.stringify(submittedPlant));

      Plant.model.createNewIfUserDefinedPropertiesModified(
        {
          plant : submittedPlant
        },
        function(err, validatedPlant){
          should.not.exist(err);
          should.exist(validatedPlant);

          should.equal( validatedPlant._id.toString() === originalSubmittedPlant._id.toString(), false, "_id should be new");
          validatedPlant.name.should.equal(originalSubmittedPlant.name);

          done();
        }
      );
    });

    it("returns the pre-existing Plant if _id and all other properties match", function(done){
      var submittedPlant = {
        _id : '50749839ab364e2a9fffd4ef', // Lemon
        name: "Lemon"
      },
      originalSubmittedPlant = JSON.parse(JSON.stringify(submittedPlant));

      Plant.model.createNewIfUserDefinedPropertiesModified(
        {
          plant : submittedPlant
        },
        function(err, validatedPlant){
          should.not.exist(err);
          should.exist(validatedPlant);

          
          Plant.model.findById(validatedPlant._id)
          .exec(function(err, originalPlant){
            should.not.exist(err);
            should.exist(originalPlant);

            should.equal(validatedPlant._id.toString(), originalPlant._id.toString());
            should.equal(validatedPlant.name, originalPlant.name);

            done();
          });
        }
      )
    });


    it("returns the pre-existing Plant if name was already taken, even if submitted _id is different", function(done){
      var submittedPlant = {
        _id : 'nonsense',
        name: "Lemon"
      },
      originalSubmittedPlant = JSON.parse(JSON.stringify(submittedPlant));

      Plant.model.createNewIfUserDefinedPropertiesModified(
        {
          plant : submittedPlant
        },
        function(err, validatedPlant){
          should.not.exist(err);
          should.exist(validatedPlant);

          
          Plant.model.findOne({ name : originalSubmittedPlant.name })
          .exec(function(err, originalPlant){
            should.not.exist(err);
            should.exist(originalPlant);

            should.equal(validatedPlant._id.toString(), originalPlant._id.toString());
            should.equal(validatedPlant.name, originalPlant.name);
            should.equal(validatedPlant._id.toString() === originalSubmittedPlant._id.toString(), false, "returned plant should have pre-existing plant's id instead of submitted id");

            done();
          });
        }
      )
    });

    
    it("returns an error if required property 'name' isn't set and silentValidationFail is false", function(done){
      var submittedPlant = {
      },
      originalSubmittedPlant = JSON.parse(JSON.stringify(submittedPlant));

      Plant.model.createNewIfUserDefinedPropertiesModified(
        {
          plant : submittedPlant
        },
        function(err, validatedPlant){
          should.exist(err);
          should.not.exist(validatedPlant);

          done();
        }
      )
    });

    it("returns nothing if required property 'name' isn't set and silentValidationFail is true", function(done){
      var submittedPlant = {
      },
      originalSubmittedPlant = JSON.parse(JSON.stringify(submittedPlant));

      Plant.model.createNewIfUserDefinedPropertiesModified(
        {
          plant : submittedPlant,
          silentValidationFail : true
        },
        function(err, validatedPlant){
          should.not.exist(err);
          should.not.exist(validatedPlant);

          done();
        }
      )
    });

  }); // /.createNewIfUserDefinedPropertiesModified

});