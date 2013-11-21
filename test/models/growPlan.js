var mongooseConnection = require('../../config/mongoose-connection').open('test'),
mongoose = require('mongoose'),
ObjectID = require('mongodb').ObjectID,
Models = require('../../models'),
GrowPlan = Models.growPlan,
PhaseSchema = require('../../models/growPlan').phase.schema,
DeviceModel = Models.device,
NotificationModel = Models.notification,
ModelUtils = Models.utils,
should = require('should'),
sampleGrowPlans = require('../../utils/db_init/seed_data/growPlans'),
async = require('async'),
requirejs = require('../../lib/requirejs-wrapper'),
feBeUtils = requirejs('fe-be-utils');


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
    

    describe('.isEquivalentTo', function(){

      beforeEach(function(done){
        var self = this;

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


      it('returns false when other GrowPlan has different "name"', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.name = 'should not match';

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
        
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "description"', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.description = 'should not match';

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
        
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "plants"', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.plants.push('50749839ab364e2a9fffd4ef');

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
        
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different number of phases', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.phases.pop();

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "phases.name"', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.phases[0].name = "don't match this";

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "phases.description"', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.phases[0].description = "don't match this";

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "phases.expectedNumberOfDays"', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.phases[0].expectedNumberOfDays = 8093485039;

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "phases.idealRanges"', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.phases[0].idealRanges.pop();

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "phases.idealRanges.valueRange.min"', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.phases[0].idealRanges[0].valueRange.min = 1;

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "phases.idealRanges.valueRange.min"', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.phases[0].idealRanges[0].valueRange.max = 50;

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "phases.idealRanges.actionBelowMin"', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.phases[0].idealRanges[0].actionBelowMin = new Models.action({
          description : "don't match this"
        });

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "phases.idealRanges.actionAboveMax"', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.phases[0].idealRanges[0].actionAboveMax = new Models.action({
          description : "don't match this"
        });

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "phases.actions" length', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.phases[0].actions.pop();

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "phases.actions"', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.phases[0].actions[0] = new Models.action({
          description : "don't match this"
        });

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "phases.phaseEndActions" length', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.phases[0].phaseEndActions.push(new Models.action({
          description : "don't match this"
        }));

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "phases.phaseEndActions" definitions', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.phases[0].phaseEndActions[0] = new Models.action({
          description : "don't match this"
        });

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "phases.nutrients"', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.phases[0].nutrients.push(new Models.nutrient({
          brand : "don't match this",
          name : "don't match this"
        }));

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });

      it('returns false when other GrowPlan has different "phases.growSystem"', function(done){
        var other = this.otherFullyPopulatedGrowPlan;
        other.phases[0].growSystem = new Models.growSystem({
          name : "don't match this",
          type : "don't match this",
          plantCapacity : 0
        });  

        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : '506de30c8eebf7524342cb70'},
          function(err, growPlans){
            should.not.exist(err);
            var growPlan = growPlans[0];
            should.exist(growPlan);
            
            GrowPlan.isEquivalentTo(growPlan, other, function(err, isEquivalent){
              should.not.exist(err);
              isEquivalent.should.be.false;
              done();
            });     
          }
        );
      });
      
    }); // /.isEquivalentTo


    describe('.createNewIfUserDefinedPropertiesModified', function(){

      beforeEach(function(done){
        var self = this,
            sourceGrowPlanId = "506de30c8eebf7524342cb70"; // All-Purpose Grow Plan
        
        self.userId = "506de30a8eebf7524342cb6c"; // AK, creator of GP 506de30c8eebf7524342cb70
        
        ModelUtils.getFullyPopulatedGrowPlan(
          {_id : sourceGrowPlanId },
          function(err, growPlans){
            self.sourceGrowPlan = growPlans[0];
            self.originalGrowPlan = JSON.parse(JSON.stringify(self.sourceGrowPlan));
            done();    
          }
        );
      });


      it('returns the original GrowPlan if there haven\'t been any modifications', function(done){
        var self = this;
        should.exist(self.sourceGrowPlan, 'self.sourceGrowPlan should exist')

        GrowPlan.createNewIfUserDefinedPropertiesModified(
          {
            growPlan : self.sourceGrowPlan,
            user : self.userId,
            visibility : 'public'
          },
          function(err, validatedGrowPlan){
            should.not.exist(err);
            should.exist(validatedGrowPlan);
            
            validatedGrowPlan._id.equals(self.originalGrowPlan._id).should.equal(true, "_id's should be the same");

            ModelUtils.getFullyPopulatedGrowPlan(
              {_id : validatedGrowPlan._id },
              function(err, growPlans){
                var fullyPopulatedValidatedGrowPlan = growPlans[0];
                should.exist(fullyPopulatedValidatedGrowPlan);

                GrowPlan.isEquivalentTo(
                  self.originalGrowPlan, 
                  fullyPopulatedValidatedGrowPlan, 
                  function(err, isEquivalent){
                    should.not.exist(err);
                    isEquivalent.should.equal(true, "sourceGrowPlan and result growPlan should be the same");
                    done();
                  }
                );
              }
            );   
          }
        );
      }); // /returns the original GrowPlan if there haven\'t been any modifications
  

      
      it('leaves associated GrowPlanInstances associated to the parent GrowPlan if the growPlan has been branched but GPI.trackGrowPlanUpdates == false', function(done){
        // TODO
        //false.should.be.true;

        // grab a GrowPlan that has a GPI already associated with it
        // set the GPI.trackGrowPlanUpdates = false
        // store the GPI id
        // tweak the grow plan, run createNewIf...
        // inside the callback of that, retrieve the GPI again
        // make sure that the old GP still exists and is equivalent to the original GP
        // make sure that the GPI still references the old GP


        return done();
      });



      describe('branching scenario (if being updated or used by non-owner or it has multiple active gardens)', function(){
      
        beforeEach(function(){
          var self = this;
          self.testUserId = '50e33086a47897af3446e26e';
        });


        it('branches GrowPlan if name has been modified', function(done){
      
          var self = this;
          should.exist(self.sourceGrowPlan, 'self.sourceGrowPlan should exist')

          self.sourceGrowPlan.name = "new unittest grow plan name";

          GrowPlan.createNewIfUserDefinedPropertiesModified(
            {
              growPlan : self.sourceGrowPlan,
              user : self.testUserId,
              visibility : 'public'
            },
            function(err, validatedGrowPlan){
              should.not.exist(err);
              should.exist(validatedGrowPlan);
              
              
              validatedGrowPlan._id.equals(self.originalGrowPlan._id).should.equal(false, "_id's should be different");
              validatedGrowPlan.parentGrowPlanId.equals(self.originalGrowPlan._id).should.equal(true, "new GP should point to original as parent");

              ModelUtils.getFullyPopulatedGrowPlan(
                {_id : validatedGrowPlan._id },
                function(err, growPlans){
                  var fullyPopulatedValidatedGrowPlan = growPlans[0];
                  should.exist(fullyPopulatedValidatedGrowPlan);

                  GrowPlan.isEquivalentTo(
                    self.originalGrowPlan, 
                    fullyPopulatedValidatedGrowPlan, 
                    function(err, isEquivalent){
                      should.not.exist(err);
                      
                      isEquivalent.should.equal(false, "originalGrowPlan and result growPlan should not be equivalent");
                      
                      self.originalGrowPlan.name.should.not.equal(self.sourceGrowPlan.name);
                      self.originalGrowPlan.name.should.not.equal(fullyPopulatedValidatedGrowPlan.name);
      
                      // The phases should be equivalent
                      var phaseIterator = 0;
                      async.eachSeries(self.originalGrowPlan.phases,
                        function itemIterator(phase, iteratorCallback){
                          (phase._id.toString() === fullyPopulatedValidatedGrowPlan.phases[phaseIterator]._id.toString()).should.equal(false, "phases should have new ids");

                          PhaseSchema.statics.isEquivalentTo(
                            phase, 
                            fullyPopulatedValidatedGrowPlan.phases[phaseIterator],
                            function(err, isEquivalent){
                              isEquivalent.should.equal(true, "phases should be equivalent");

                              phaseIterator++;
                              return iteratorCallback();
                            }
                          );
                        },
                        function loopEnd(){
                          done();
                        }
                      );
                    }
                  );
                }
              );   
            }
          );
        }); // /updates original GrowPlan if name has been modified and owner is the solo user

        
      }); // /branching scenario (if being updated or used by non-owner...)
      


      describe('non-branching scenario (if being updated for a solo user)', function(){


        
        it('updates GrowPlan in-place and stores original in history', function(done){
      
          var self = this,
              testStartedAt = new Date();
          should.exist(self.sourceGrowPlan, 'self.sourceGrowPlan should exist')

          self.sourceGrowPlan.name = "new unittest grow plan name";

          GrowPlan.createNewIfUserDefinedPropertiesModified(
            {
              growPlan : self.sourceGrowPlan,
              user : self.userId,
              visibility : 'public'
            },
            function(err, validatedGrowPlan){
              should.not.exist(err);
              should.exist(validatedGrowPlan);
              
              validatedGrowPlan._id.equals(self.originalGrowPlan._id).should.equal(true, "_id's should be the same");

              async.parallel([
                function checkHistory(innerCallback){
                  var GrowPlanHistoryModel = Models.growPlanHistory;

                  GrowPlanHistoryModel
                  .find({growPlanId : self.originalGrowPlan._id, createdAt : { $gte : testStartedAt }})
                  .exec(function(err, historyResults){
                    should.not.exist(err);
                    should.exist(historyResults[0], "should have GrowPlanHistory result");

                    GrowPlan.isEquivalentTo(
                      self.originalGrowPlan, 
                      historyResults[0].growPlanObject,
                      function(err, isEquivalent){
                        isEquivalent.should.equal(true, "original should be stored in history");
                        return innerCallback();
                      }
                    );  
                  });
                  
                },
                function checkUpdate(innerCallback){
                  ModelUtils.getFullyPopulatedGrowPlan(
                    {_id : validatedGrowPlan._id },
                    function(err, growPlans){
                      var fullyPopulatedValidatedGrowPlan = growPlans[0];
                      should.exist(fullyPopulatedValidatedGrowPlan);

                      GrowPlan.isEquivalentTo(
                        self.originalGrowPlan, 
                        fullyPopulatedValidatedGrowPlan,
                        function(err, isEquivalent){
                          should.not.exist(err);
                          
                          isEquivalent.should.equal(false, "originalGrowPlan and result growPlan should not be equivalent");
                          
                          self.originalGrowPlan.name.should.not.equal(self.sourceGrowPlan.name);
                          self.originalGrowPlan.name.should.not.equal(fullyPopulatedValidatedGrowPlan.name);
          
                          // The phases should be equivalent though, and also retain the original id's
                          var phaseIterator = 0;
                          async.eachSeries(self.originalGrowPlan.phases,
                            function itemIterator(phase, iteratorCallback){
                              phase._id.toString().should.equal(fullyPopulatedValidatedGrowPlan.phases[phaseIterator]._id.toString(), "phases should retain original ids");

                              PhaseSchema.statics.isEquivalentTo(
                                phase, 
                                fullyPopulatedValidatedGrowPlan.phases[phaseIterator],
                                function(err, isEquivalent){
                                  isEquivalent.should.equal(true, "phases should be equivalent");

                                  phaseIterator++;
                                  return iteratorCallback();
                                }
                              );
                            },
                            function loopEnd(){
                              innerCallback();
                            }
                          );
                        }
                      );
                    }
                  );
                }
              ],
              function parallelEnd(err, results){
                done();
              });
            }
          );
        }); // /updates original GrowPlan



        it('makes phase changes in-place on original phases', function(done){
          var self = this;
          should.exist(self.sourceGrowPlan, 'self.sourceGrowPlan should exist')

          var newAction = { 
            description: "do something unit testy"
          };

          self.sourceGrowPlan.phases[0].actions.push(newAction);

          GrowPlan.createNewIfUserDefinedPropertiesModified(
            {
              growPlan : self.sourceGrowPlan,
              user : self.userId,
              visibility : 'public'
            },
            function(err, validatedGrowPlan){
              should.not.exist(err);
              should.exist(validatedGrowPlan);
              
              validatedGrowPlan._id.equals(self.originalGrowPlan._id).should.equal(true, "_id's should be the same");

              ModelUtils.getFullyPopulatedGrowPlan(
                {_id : validatedGrowPlan._id },
                function(err, growPlans){
                  var fullyPopulatedValidatedGrowPlan = growPlans[0];
                  should.exist(fullyPopulatedValidatedGrowPlan);

                  GrowPlan.isEquivalentTo(
                    self.originalGrowPlan, 
                    fullyPopulatedValidatedGrowPlan, 
                    function(err, isEquivalent){
                      should.not.exist(err);
                      
                      isEquivalent.should.equal(false, "originalGrowPlan and result growPlan should not be equivalent");
      
                      // All phases except the first should be equivalent, and all should retain the original id's
                      var phaseIterator = 0;
                      async.eachSeries(self.originalGrowPlan.phases,
                        function itemIterator(phase, iteratorCallback){
                          
                          phase._id.toString().should.equal(fullyPopulatedValidatedGrowPlan.phases[phaseIterator]._id.toString(), "phases should retain original ids");

                          PhaseSchema.statics.isEquivalentTo(
                            phase, 
                            fullyPopulatedValidatedGrowPlan.phases[phaseIterator],
                            function(err, isEquivalent){
                              if (phaseIterator === 0){
                                isEquivalent.should.equal(false, "first phase should not be equivalent");

                                var hasNewAction = fullyPopulatedValidatedGrowPlan.phases[phaseIterator].actions.some(function(action){
                                  return action.description === newAction.description;
                                });

                                hasNewAction.should.equal(true, "newAction should exist in action array");
                              } else {
                                isEquivalent.should.equal(true, "other phases should be equivalent");  
                              }
                              
                              phaseIterator++;
                              return iteratorCallback();
                            }
                          );
                        },
                        function loopEnd(){
                          done();
                        }
                      );
                    }
                  );
                }
              );   
            }
          );
        }); // /updates original phases


  
        it('updates associated active GrowPlanInstances without devices', function(done){
          // grab a GrowPlan that has a GPI already associated with it
          // set the GPI.trackGrowPlanUpdates = true
          // store the GPI id
          // tweak the grow plan. change an action that affects a control that something something
          // run createNewIf...
          // inside the callback of that, retrieve the GPI again
          // make sure that the old GP still exists and is equivalent to the original GP
          // make sure that the GPI references the new GP
          // make sure that any obsolete Notifications for the GPI are expired
          // make sure that any new Notifications for the GPI exist
          // make sure that if the GPI has a device, the device's actions are refreshed
          

          var self = this,
              sourceGrowPlanId = "506de30c8eebf7524342cb70",
              growPlanInstanceId = "51a7b69ca3b04db08057e047",
              GrowPlanInstanceModel = Models.growPlanInstance,
              testStartedAt = new Date();
          
          self.userId = "506de30a8eebf7524342cb6c";
          
          async.parallel(
            [
              function getGrowPlan(innerCallback){
                ModelUtils.getFullyPopulatedGrowPlan(
                  {_id : sourceGrowPlanId }, 
                  function(err, growPlans){
                    self.sourceGrowPlan = growPlans[0];
                    self.originalGrowPlan = JSON.parse(JSON.stringify(self.sourceGrowPlan));
                    return innerCallback();
                  }
                );      
              },
              function getGrowPlanInstance(innerCallback){
                GrowPlanInstanceModel.findById(growPlanInstanceId)
                .exec(function(err, growPlanInstanceResult){
                  should.not.exist(err);
                  should.exist(growPlanInstanceResult);
                  self.growPlanInstance = growPlanInstanceResult;
                  self.originalGrowPlanInstance = JSON.parse(JSON.stringify(self.growPlanInstance));
                  return innerCallback();
                });
              }
            ], 
            function(err, results){
              should.not.exist(err);
              

              // remove the light action from the first phase, just something to trigger an update and garden migrations
              self.sourceGrowPlan.phases[0].actions = self.sourceGrowPlan.phases[0].actions.filter(function(item){ return item._id.toString() !== "506de2f18eebf7524342cb27"});


              GrowPlan.createNewIfUserDefinedPropertiesModified(
              {
                growPlan : self.sourceGrowPlan,
                user : self.userId,
                visibility : 'public'
              },
              function(err, updatedGrowPlan){
                should.not.exist(err);
                should.exist(updatedGrowPlan);
                
                updatedGrowPlan._id.equals(self.originalGrowPlan._id).should.equal(true, "updatedGrowPlan should have same _id");

                async.parallel(
                  [
                    function checkGPI(innerCallback){
                      // get the GPI again
                      GrowPlanInstanceModel.findById(growPlanInstanceId)
                      .exec(function(err, updatedGrowPlanInstance){
                        should.not.exist(err);
                        should.exist(updatedGrowPlanInstance);
              
                        updatedGrowPlanInstance.growPlan.equals(updatedGrowPlan._id).should.equal(true, "GPI should still reference the original GrowPlan"); 

                        // Should contain a migration entry
                        var migrationEntry = updatedGrowPlanInstance.growPlanMigrations[updatedGrowPlanInstance.growPlanMigrations.length - 1];
                        should.exist(migrationEntry, "GPI should have a migration entry");
                        migrationEntry.oldGrowPlan.equals(sourceGrowPlanId).should.equal(true, "migrationEntry.oldGrowPlan should reference original GP");
                        migrationEntry.newGrowPlan.equals(updatedGrowPlan._id).should.equal(true, "migrationEntry.newGrowPlan should reference updated GP");
                        migrationEntry.ts.valueOf().should.be.above(testStartedAt.valueOf(), "migrationEntry timestamp should be after the start of this test");

                        // GPI's active phase should be the same
                        var originalActiveGPIPhase = self.originalGrowPlanInstance.phases.filter(function(phase) { return phase.active; })[0];

                        var updatedGrowPlanInstanceOriginalActiveGPIPhase = updatedGrowPlanInstance.phases.filter(function(phase) { return phase._id.toString() === originalActiveGPIPhase._id; })[0];

                        updatedGrowPlanInstanceOriginalActiveGPIPhase.active.should.equal(true, "Previously active phase should remain activate");

                        //var currentActiveGPIPhase = updatedGrowPlanInstance.phases.filter(function(phase) { return !!phase.active; })[0];
                        //should.exist(currentActiveGPIPhase, "Updated GPI should have an active phase");
                        //updatedGrowPlan.phases.some(function(gpPhase){ return gpPhase._id.equals(currentActiveGPIPhase.phase);}).should.equal(true, "GPI should have an active phase that's in the updated GrowPlan")
                        
                        // GPI's device's actions should be updated to remove the light action
                        
                        return innerCallback();
                      });
                    },
                    function checkDevice(innerCallback){
                      return innerCallback();
                      
                      /*
                      DeviceModel.findById(self.originalGrowPlanInstance.device)
                      .exec(function(err, device){
                        should.exist(device);
                        var deviceNow = Date.now();
                        device.status.expires.valueOf().should.be.below(deviceNow, "device status should be expired in order to force a refresh on next request");
                        return innerCallback();
                      })
                      */
                    },
                    function checkNotifications(innerCallback){
                      NotificationModel.find({
                        gpi : self.originalGrowPlanInstance._id,
                        createdAt : { $gte : testStartedAt }
                      }).exec(function(err, notifications){
                        should.not.exist(err);
                        should.exist(notifications);
                        notifications.length.should.be.above(0, "There should be some notifications triggered");
                        
                        notifications.some(function(notification){ 
                          return ( notification.trigger === feBeUtils.NOTIFICATION_TRIGGERS.GROW_PLAN_UPDATE && notification.triggerDetails.migrationSuccessful === true);
                        }).should.equal(true, "should have a successful grow plan update notification");

                        return innerCallback();
                      });
                    }
                  ],
                  function parallelFinal(err){
                    should.not.exist(err);
                    return done();
                  });
              });       
            }
          );
        }); // /updates associated active GrowPlanInstances without devices



      }); // /non-branching scenario (if being updated for a solo user)

    

    }); // /createNewIfUserDefinedPropertiesModified
    

  });