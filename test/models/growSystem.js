var mongoose = require('mongoose'),
  GrowSystem = require('../../models/growSystem'),
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

describe('GrowSystem', function(){

  describe(".createNewIfUserDefinedPropertiesModified", function(){

    it("creates a new GrowSystem if _id isn't a valid ObjectId", function(done){
      var submittedGrowSystem = {
        _id : "nonsense",
        name : "grow system name"
      },
      originalSubmittedGrowSystem = JSON.parse(JSON.stringify(submittedGrowSystem));;

      GrowSystem.model.createNewIfUserDefinedPropertiesModified(
        {
          growSystem : submittedGrowSystem
        },
        function(err, validatedGrowSystem){
          should.not.exist(err);
          should.exist(validatedGrowSystem);

          should.equal(validatedGrowSystem.name, originalSubmittedGrowSystem.name);

          done();
        }
      );
    });

    it("creates a new GrowSystem if _id matches an existing GrowSystem but rest of properties don't match", function(done){
      var submittedGrowSystem = {
        _id : "506de2ff8eebf7524342cb3c", // Drip
        name : "unmatching grow system name"
      },
      originalSubmittedGrowSystem = JSON.parse(JSON.stringify(submittedGrowSystem));

      GrowSystem.model.createNewIfUserDefinedPropertiesModified(
        {
          growSystem : submittedGrowSystem
        },
        function(err, validatedGrowSystem){
          should.not.exist(err);
          should.exist(validatedGrowSystem);

          should.equal( validatedGrowSystem._id.toString() === originalSubmittedGrowSystem._id.toString(), false, "_id should be new");
          validatedGrowSystem.name.should.equal(originalSubmittedGrowSystem.name);

          done();
        }
      );
    });

    it("returns the pre-existing GrowSystem if _id and all other properties match", function(done){
      var submittedGrowSystem = {
        _id : '506de2ff8eebf7524342cb3c',
        name: "Drip",
        description: "Drip system.",
        type: "deep water culture (DWC)",
        reservoirSize: 5, //gallons
        plantCapacity: 6
      },
      originalSubmittedGrowSystem = JSON.parse(JSON.stringify(submittedGrowSystem));

      GrowSystem.model.createNewIfUserDefinedPropertiesModified(
        {
          growSystem : submittedGrowSystem
        },
        function(err, validatedGrowSystem){
          should.not.exist(err);
          should.exist(validatedGrowSystem);

          
          GrowSystem.model.findById(validatedGrowSystem._id)
          .exec(function(err, originalGrowSystem){
            should.not.exist(err);
            should.exist(originalGrowSystem);

            should.equal(validatedGrowSystem._id.toString(), originalGrowSystem._id.toString());
            should.equal(validatedGrowSystem.name, originalGrowSystem.name);
            should.equal(validatedGrowSystem.description, originalGrowSystem.description);
            should.equal(validatedGrowSystem.type, originalGrowSystem.type);
            should.equal(validatedGrowSystem.reservoirSize, originalGrowSystem.reservoirSize);
            should.equal(validatedGrowSystem.plantCapacity, originalGrowSystem.plantCapacity);

            done();
          });
        }
      )
    });

    
    it("returns an error if required property 'name' isn't set and silentValidationFail is false", function(done){
      var submittedGrowSystem = {
      },
      originalSubmittedGrowSystem = JSON.parse(JSON.stringify(submittedGrowSystem));

      GrowSystem.model.createNewIfUserDefinedPropertiesModified(
        {
          growSystem : submittedGrowSystem
        },
        function(err, validatedGrowSystem){
          should.exist(err);
          should.not.exist(validatedGrowSystem);

          done();
        }
      )
    });

    it("returns nothing if required property 'name' isn't set and silentValidationFail is true", function(done){
      var submittedGrowSystem = {
      },
      originalSubmittedGrowSystem = JSON.parse(JSON.stringify(submittedGrowSystem));

      GrowSystem.model.createNewIfUserDefinedPropertiesModified(
        {
          growSystem : submittedGrowSystem,
          silentValidationFail : true
        },
        function(err, validatedGrowSystem){
          should.not.exist(err);
          should.not.exist(validatedGrowSystem);

          done();
        }
      )
    });

  }); // /.createNewIfUserDefinedPropertiesModified

});