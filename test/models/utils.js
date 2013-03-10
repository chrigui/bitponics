var mongoose = require('mongoose'),
  ObjectID = require('mongodb').ObjectID,
  ImmediateActionLog = require('../../models/immediateActionLog').model,
  GrowPlanInstance = require('../../models/growPlanInstance').model,
  ModelUtils = require('../../models/utils'),
  should = require('should'),
  User = require('../../models/user').model,
  async = require('async');


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

describe('Model Utils', function(){

  describe('.triggerImmediateAction', function(){
    
    beforeEach(function(done){
      var self = this,
          newUserObjectID = new ObjectID();

      self.actionId = '506de2fb8eebf7524342cb28' // turn lights on;

      async.series(
        [
          function(innerCallback){
            User.createUserWithPassword(
              {
                _id : newUserObjectID,
                email : 'unittest@bitponics.com',
                name : {
                  first : "Testfirstname",
                  last : "Testlastname"
                },
                locale: "en_US",
                active : true,
                activationToken : "1234567890",
                sentEmail : true
              },
              '8bitpass',
              function(err, user){
                self.user = user;
                return innerCallback();
              }
            );      
          },
          function(innerCallback){
            GrowPlanInstance.create(
              {
                growPlan : '506de2ff8eebf7524342cb3a',
                owner : newUserObjectID,
                active : true
              },
              function(err, gpi){
                self.gpi = gpi;
                return innerCallback();
              }
            );
          }
        ],
        function(err){
          return done();
        }
      );
    });

    it('dum dada dum', function(done){
      should.exist(this.user);
      should.exist(this.gpi);
      should.exist(this.actionId);

      ModelUtils.triggerImmediateAction(
        {
          growPlanInstance : this.gpi, 
          actionId : this.actionid, 
          immediateActionMessage : 'message', 
          user : this.user
        },
        function(err){
          //should.not.exist(err);
          done();
        }
      );

      
    });

  });

});
