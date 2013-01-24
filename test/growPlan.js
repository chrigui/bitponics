var mongoose = require('mongoose'),
ObjectID = require('mongodb').ObjectID,
Models = require('../models'),
GrowPlan = Models.growPlan,
ModelUtils = Models.utils,
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


    describe('#getPhaseAndDayFromStartDay(numberOfDays)', function(){
      // TODO : this
    });
    

    describe('#isEquivalentTo(other, callback)', function(){

      beforeEach(function(done){
        var self = this,
            other = sampleGrowPlans[0];
        
        other._id = new ObjectID();
        self.other = new GrowPlan(other);

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            self.otherFullyPopulatedGrowPlan = growPlans[0];
            done();
          }
        );
      });


      it('returns true when other GrowPlan is equivalent', function(done){
        var other = this.otherFullyPopulatedGrowPlan;

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.true;
              done();
            });
          }
        );
      });

/*
      it('returns false when other GrowPlan has different "name"', function(done){
        var other = this.other;        
        other.name = 'should not match';

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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
        var other = this.other;
        other.plants.push('50749839ab364e2a9fffd4ef');

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

      it('returns false when other GrowPlan has different number of phases', function(done){
        var other = this.other;
        other.phases.pop();

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

      it('returns false when other GrowPlan has different "phases.name"', function(done){
        var other = this.other;
        other.phases[0].name = "don't match this";

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

      it('returns false when other GrowPlan has different "phases.description"', function(done){
        var other = this.other;
        other.phases[0].description = "don't match this";

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

      it('returns false when other GrowPlan has different "phases.expectedNumberOfDays"', function(done){
        var other = this.other;
        other.phases[0].expectedNumberOfDays = 8093485039;

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

      it('returns false when other GrowPlan has different "phases.idealRanges"', function(done){
        var other = this.other;
        other.phases[0].idealRanges.pop();

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

      it('returns false when other GrowPlan has different "phases.idealRanges.valueRange.min"', function(done){
        var other = this.other;
        other.phases[0].idealRanges[0].valueRange.min = 1;

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

      it('returns false when other GrowPlan has different "phases.idealRanges.valueRange.min"', function(done){
        var other = this.other;
        other.phases[0].idealRanges[0].valueRange.max = 50;

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

      it('returns false when other GrowPlan has different "phases.idealRanges.actionBelowMin"', function(done){
        var other = this.other;
        other.phases[0].idealRanges[0].actionBelowMin = new ObjectID();
        
        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

      it('returns false when other GrowPlan has different "phases.idealRanges.actionAboveMax"', function(done){
        var other = this.other;
        other.phases[0].idealRanges[0].actionAboveMax = new ObjectID();

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

      it('returns false when other GrowPlan has different "phases.actions" length', function(done){
        var other = this.other;
        other.phases[0].actions.pop();

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

      it('returns false when other GrowPlan has different "phases.actions"', function(done){
        var other = this.other;
        other.phases[0].actions[0] = new ObjectID();

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

      it('returns false when other GrowPlan has different "phases.phaseEndActions" length', function(done){
        var other = this.other;
        other.phases[0].phaseEndActions.push(new ObjectID());

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

      it('returns false when other GrowPlan has different "phases.phaseEndActions"', function(done){
        var other = this.other;
        other.phases[0].phaseEndActions[0] = new ObjectID();

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

      it('returns false when other GrowPlan has different "phases.nutrients"', function(done){
        var other = this.other;
        other.phases[0].nutrients.push(new ObjectID());

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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

      it('returns false when other GrowPlan has different "phases.growSystem"', function(done){
        var other = this.other;
        other.phases[0].growSystem = new ObjectID();

        GrowPlan.findById('506de30c8eebf7524342cb70')
        .populate('phases.actions')
        .populate('phases.phaseEndActions')
        .populate('phases.idealRanges.actionBelowMin')
        .populate('phases.idealRanges.actionAboveMax')
        .exec(function(err, growPlan){
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
*/
      
    });
    
  });