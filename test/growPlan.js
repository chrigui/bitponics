var mongoose = require('mongoose'),
ObjectId = mongoose.Schema.ObjectId,
GrowPlan = require('../models/growPlan').growPlan.model,
should = require('should'),
sampleGrowPlans = require('../utils/db_init/seed_data/growPlans');


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
 describe('GrowPlan', function(){
 	
  /*
   * beforeEach Method
   *
	 * Run before each test.
	 */
	 beforeEach(function(done){
	 	done();
	 });


   /*
    * afterEach method
    *
    * Run after each test.
    * Remove the test user.
    */
    afterEach(function(done){
    	done();
    });


    describe('#isEquivalentTo(other, callback)', function(){
      beforeEach(function(){
        var other = sampleGrowPlans[0];
        other._id = new ObjectId();
        this.other = new GrowPlan(other);
      });

      it('returns true when other GrowPlan is equivalent', function(done){
        var other = this.other;

        GrowPlan.findById('506de30c8eebf7524342cb70',
          function(err, growPlan){
            should.not.exist(err);
            should.exist(growPlan);
            growPlan.isEquivalentTo(other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.true;
              done();
            });     
          }
        );
      });


      it('returns false when other GrowPlan has different "name"', function(done){
        var other = this.other;        
        other.name = 'should not match';

        GrowPlan.findById('506de30c8eebf7524342cb70',
          function(err, growPlan){
            should.not.exist(err);
            should.exist(growPlan);
            growPlan.isEquivalentTo(other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "description"', function(done){
        var other = this.other;
        other.description = 'should not match';

        GrowPlan.findById('506de30c8eebf7524342cb70',
          function(err, growPlan){
            should.not.exist(err);
            should.exist(growPlan);
            
            growPlan.isEquivalentTo(other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "plants"', function(done){
        done();
      });

      it('returns false when other GrowPlan has different number of phases', function(done){
        done();
      });

      it('returns false when other GrowPlan has different "phases.name"', function(done){
        done();
      });

      it('returns false when other GrowPlan has different "phases.description"', function(done){
        done();
      });

      it('returns false when other GrowPlan has different "phases.expectedNumberOfDays"', function(done){
        done();
      });

      it('returns false when other GrowPlan has different "phases.idealRanges"', function(done){
        done();
      });

      it('returns false when other GrowPlan has different "phases.actions"', function(done){
        done();
      });

      it('returns false when other GrowPlan has different "phases.phaseEndActions"', function(done){
        done();
      });

      it('returns false when other GrowPlan has different "phases.nutrients"', function(done){
        done();
      });

      it('returns false when other GrowPlan has different "phases.growSystem"', function(done){
        done();
      });

      
    });
    
  });