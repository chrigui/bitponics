var mongoose = require('mongoose'),
  ObjectID = require('mongodb').ObjectID,
  ImmediateAction = require('../../models/immediateAction').model,
  GrowPlanInstance = require('../../models/growPlanInstance').model,
  ModelUtils = require('../../models/utils'),
  should = require('should'),
  User = require('../../models/user').model,
  async = require('async'),
  getObjectId = ModelUtils.getObjectId,
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

    it('handles action without control', function(done){
      // triggering an action without a control is actually 
      // probably never going to happen. but no reason to block it,
      // and the code handles it so i'm unit-testing it

      should.exist(this.user);
      should.exist(this.gpi);
      should.exist(this.actionId);

      var immediateActionSettings = {
        growPlanInstance : this.gpi, 
        actionId : "506de2fc8eebf7524342cb2c", // pollinate blossons
        immediateActionMessage : "triggering pollination action blam.", 
        user : this.user
      };

      ModelUtils.triggerImmediateAction(
        immediateActionSettings,
        function(err, results){
          should.not.exist(err);
          
          var now = new Date(),
              immediateAction = results.immediateAction,
              notification = results.notification;

          should.exist(immediateAction);
          should.exist(notification);
          
          // immediateAction
          // timeSent should be undefined (hasn't been sent yet)
          should.not.exist(immediateAction.timeSent);
          // timeRequested should be less than now
          immediateAction.timeRequested.should.be.below(now);
          // action should be settings.action
          getObjectId(immediateAction.action).equals(getObjectId(immediateActionSettings.actionId)).should.be.true;
          // done should not be true
          immediateAction.done.should.be.false;
          // message should be message
          immediateAction.message.should.equal(immediateActionSettings.immediateActionMessage);
          // growPlanInstance should be settings.growPlanInstance
          getObjectId(immediateAction.growPlanInstance).equals(getObjectId(immediateActionSettings.growPlanInstance)).should.be.true;
          

          // notification
          // growPlanInstance should be settings.growPlanInstance
          getObjectId(notification.growPlanInstance).equals(getObjectId(immediateActionSettings.growPlanInstance)).should.be.true;
          // message should be message of action
          notification.message.should.equal(i18nKeys.get('manual action trigger message', immediateActionSettings.immediateActionMessage, "Pollinate any new blossoms. Use a small paintbrush or cotton swab brush to distribute pollen between flowers."));
          // type should be actionneeded
          notification.type.should.equal('actionNeeded');
          // sentLogs should be empty array
          notification.sentLogs.should.be.empty;
          // timeToSend should be less than now
          notification.timeToSend.should.be.below(now);
          // users should include settings.user
          notification.users.should.include(immediateActionSettings.user._id.toString());
          // repeat shouldn't exist
          notification.repeat.should.not.have.property('repeatType');
          notification.repeat.should.not.have.property('duration');
          notification.repeat.should.not.have.property('timezone');
          notification.repeat.should.not.have.property('rt');
          notification.repeat.should.not.have.property('d');
          notification.repeat.should.not.have.property('tz');
          

          done();
        }
      );
    });

    it('handles action with control', function(done){
      done();
    });

    it('handles action without control and repeat', function(done){
      done();
    });

  });

});
