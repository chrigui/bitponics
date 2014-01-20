var mongooseConnection = require('../../../config/mongoose-connection').open('test'),
	mongoose = require('mongoose'),
  ObjectID = require('mongodb').ObjectID,
  Notification = require('../../../models/notification'),
  Device = require('../../../models/device'),
  should = require('should'),
  async = require('async'),
  requirejs = require('../../../lib/requirejs-wrapper'),
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

describe('Notification', function(){

  it('uses only friendly property names in toObject result', function(){
    var now = Date.now(),
      log = new Notification.model({
        users : [ new ObjectID() ],
        growPlanInstance : new ObjectID(),
        timeToSend : now,
        repeat : {
          repeatType : 'weeks',
          duration : 4,
          timezone : 'America/New_York'
        },
        sentLogs : [],
        type : feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED
      });

    var result = log.toObject();

    // only friendly 'users' should exist
    result.should.not.have.property('u');
    result.should.have.property('users');

    // only friendly 'growPlanInstance' should exist
    result.should.not.have.property('gpi');
    result.should.have.property('growPlanInstance');

    // only friendly 'timeToSend' should exist
    result.should.not.have.property('tts');
    result.should.have.property('timeToSend');

    // only friendly 'repeat' should exist
    result.should.not.have.property('r');
    result.should.have.property('repeat');

    // only friendly 'sentLogs' should exist
    result.should.not.have.property('sl');
    result.should.have.property('sentLogs');

    // only friendly 'type' should exist
    result.should.not.have.property('t');
    result.should.have.property('type');
  });

  it('uses only friendly property names in toJSON result', function(){
    var now = Date.now(),
      log = new Notification.model({
        users : [ new ObjectID() ],
        growPlanInstance : new ObjectID(),
        timeToSend : now,
        repeat : {
          repeatType : 'weeks',
          duration : 4,
          timezone : 'America/New_York'
        },
        sentLogs : [],
        type : feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED
      });

    var result = log.toJSON();

    // only friendly 'users' should exist
    result.should.not.have.property('u');
    result.should.have.property('users');

    // only friendly 'growPlanInstance' should exist
    result.should.not.have.property('gpi');
    result.should.have.property('growPlanInstance');

    // only friendly 'timeToSend' should exist
    result.should.not.have.property('tts');
    result.should.have.property('timeToSend');

    // only friendly 'repeat' should exist
    result.should.not.have.property('r');
    result.should.have.property('repeat');

    // only friendly 'sentLogs' should exist
    result.should.not.have.property('sl');
    result.should.have.property('sentLogs');

    // only friendly 'type' should exist
    result.should.not.have.property('t');
    result.should.have.property('type');
  });

  describe(".clearPendingNotifications", function(done){
    
    beforeEach(function(done){
      var self = this;
      
      async.waterfall([
        function saveAllNotifications(innerCallback) {
          Notification.model.find({}).exec(function(err, notifications){
            self.oldNotifications = notifications;
            innerCallback();
          });
        },
        function removeAllNotifications(innerCallback) {
          Notification.model.remove({}, function(err){
            innerCallback();
          });
        },
        function prepareNotification1(innerCallback){
          var now = new Date();
          //shouldnt send
          Notification.model.create({
            "_id" : ObjectID("521edeb06179930400000015"), 
            "gpi" : ObjectID("51caf958f613580200000270"), 
            "trigger" : feBeUtils.NOTIFICATION_TRIGGERS.DEVICE_MISSING, 
            "triggerDetails" : { 
              "deviceId" : "000666809f76",
              "lastConnectionAt" : new Date("2013-08-29T12:00:00.000Z")
            }, 
            "tts" : now, 
            "type" : feBeUtils.NOTIFICATION_TYPES.INFO, 
            "u" : [  ObjectID("506de30a8eebf7524342cb6c") ]
          }, function(err, notification){
            self.notification1 = notification;
            return innerCallback();   
          });
        },
        function prepareNotification2(innerCallback){
          var now = new Date();
          //should send
          Notification.model.create({
            "_id" : ObjectID("5203aba6cddbb70000000014"), 
            "gpi" : ObjectID("51caf958f613580200000270"), 
            "trigger" : feBeUtils.NOTIFICATION_TRIGGERS.DEVICE_MISSING, 
            "triggerDetails" : { 
              "deviceId" : "000666809f76",
              "lastConnectionAt" : new Date("2013-08-29T12:00:00.000Z")
            }, 
            "tts" : now, 
            "type" : feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED, 
            "u" : [  ObjectID("506de30a8eebf7524342cb6c") ]
          }, function(err, notification){
            self.notification2 = notification;
            return innerCallback();   
          });

        }
      ],
      function(err){
        return done();
      });
    });

    afterEach(function(done){
      var self = this;
      Notification.model.remove({
        '_id': { 
          $in: [self.notification1._id, self.notification2._id]
        }
      }, done);
      // Notification.model.create(self.oldNotifications);
    });

    it('Do not email INFO notifications', function(done){
      var self = this;
        should.exist(self.notification1);
        should.exist(self.notification2);

        Notification.model.clearPendingNotifications({ 
          env: 'local'
        }, function(err, count){
          console.log('count', count);
          should.not.exist(err);
          count.should.equal(2);
          return done();
        });
    });
  });

  describe(".create", function(){
    
    it('Creates new notification', function(done){
      var now = new Date();
      Notification.model.create({
        gpi : ObjectID("51a7b69ca3b04db08057e047"),
        trigger : feBeUtils.NOTIFICATION_TRIGGERS.PHASE_ACTION,
        triggerDetails : {
          gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
          actionId : ObjectID("506de2f18eebf7524342cb27"),
          phaseName : "Seedling"
        },
        _id : ObjectID("5203aba6cddbb70000000014"),
        type : feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED,
        sl : [ ],
        r : {
          durationType : "days",
          duration : 1,
          timezone : "America/New_York"
        },
        tts : now,
        u : [
          ObjectID("506de30a8eebf7524342cb6c")
        ]
      }, function (err, n) {
        should.not.exist(err);
        should.exist(n);
        n.should.have.property('_id');
        return done();
      });
    });

    it('Should not create a new notification when it already exists', function(done){
      var now = new Date(),
        options = {
          gpi : ObjectID("51a7b69ca3b04db08057e047"),
          trigger : feBeUtils.NOTIFICATION_TRIGGERS.PHASE_ACTION,
          triggerDetails : {
            gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
            actionId : ObjectID("506de2f18eebf7524342cb27"),
            phaseName : "Seedling"
          },
          _id : ObjectID("5203aba6cddbb70000000014"),
          type : feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED,
          sl : [ ],
          r : {
            durationType : "days",
            duration : 1,
            timezone : "America/New_York"
          },
          tts : now,
          u : [
            ObjectID("506de30a8eebf7524342cb6c")
          ]
        };

      Notification.model.create(options, function (err, n) {
        should.not.exist(err);
        should.exist(n);
        n.should.have.property('_id');

        Notification.model.create(options, function (err, n2) {
          should.not.exist(err);
          should.exist(n2);
          n2.should.have.property('_id');
          n._id.toString().should.equal(n2._id.toString());

          Notification.model.findById(n._id, function(err, notification) {
            should.not.exist(err);
            should.exist(notification);
            return done();
          });
          
        });
      });
    });

    it('Should not create a new notification with tts in the past', function(done){
      var now = new Date();
      Notification.model.create({
        gpi : new ObjectID(),
        trigger : feBeUtils.NOTIFICATION_TRIGGERS.PHASE_ACTION,
        triggerDetails : {
          gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
          actionId : ObjectID("506de2f18eebf7524342cb27"),
          phaseName : "Seedling"
        },
        _id : new ObjectID(),
        type : feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED,
        sl : [ ],
        r : {
          durationType : "days",
          duration : 1,
          timezone : "America/New_York"
        },
        tts : "2013-08-08T14:31:02.788Z",
        u : [
          ObjectID("506de30a8eebf7524342cb6c")
        ]
      }, function (err, n) {
        should.exist(err);
        return done();
      });
    });

    it('Should create a new notification with tts in the future', function(done){
      var now = Date.now();
      Notification.model.create({
        gpi : new ObjectID(),
        trigger : feBeUtils.NOTIFICATION_TRIGGERS.PHASE_ACTION,
        triggerDetails : {
          gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
          actionId : ObjectID("506de2f18eebf7524342cb27"),
          phaseName : "Seedling"
        },
        _id : new ObjectID(),
        type : feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED,
        sl : [ ],
        r : {
          durationType : "days",
          duration : 1,
          timezone : "America/New_York"
        },
        tts : "2022-08-08T14:31:02.788Z",
        u : [
          ObjectID("506de30a8eebf7524342cb6c")
        ]
      }, function (err, n) {
        should.not.exist(err);
        should.exist(n);
        return done();
      });
    });

    it('Can create a new notification without tts date', function(done){
      var now = new Date();
      Notification.model.create({
        gpi : new ObjectID(),
        trigger : feBeUtils.NOTIFICATION_TRIGGERS.PHASE_ACTION,
        triggerDetails : {
          gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
          actionId : ObjectID("506de2f18eebf7524342cb27"),
          phaseName : "Seedling"
        },
        _id : new ObjectID(),
        type : feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED,
        sl : [ ],
        r : {
          durationType : "days",
          duration : 1,
          timezone : "America/New_York"
        },
        tts : null,
        u : [
          ObjectID("506de30a8eebf7524342cb6c")
        ]
      }, function (err, n) {
        should.not.exist(err);
        should.exist(n);
        return done();
      });
    });

    it('Can create a new notification with tts date of now', function(done){
      var now = new Date();
      Notification.model.create({
        gpi : new ObjectID(),
        trigger : feBeUtils.NOTIFICATION_TRIGGERS.PHASE_ACTION,
        triggerDetails : {
          gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
          actionId : ObjectID("506de2f18eebf7524342cb27"),
          phaseName : "Seedling"
        },
        _id : new ObjectID(),
        type : feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED,
        sl : [ ],
        r : {
          durationType : "days",
          duration : 1,
          timezone : "America/New_York"
        },
        tts : new Date(),
        u : [
          ObjectID("506de30a8eebf7524342cb6c")
        ]
      }, function (err, n) {
        should.not.exist(err);
        should.exist(n);
        return done();
      });
    });

    it('Cannot create a new notification with tts date of 30s ago', function(done){
      var now = new Date();
      
      Notification.model.create({
        gpi : new ObjectID(),
        trigger : feBeUtils.NOTIFICATION_TRIGGERS.PHASE_ACTION,
        triggerDetails : {
          gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
          actionId : ObjectID("506de2f18eebf7524342cb27"),
          phaseName : "Seedling"
        },
        _id : new ObjectID(),
        type : feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED,
        sl : [ ],
        r : {
          durationType : "days",
          duration : 1,
          timezone : "America/New_York"
        },
        tts : new Date((new Date()).valueOf() - 30 * 1000),
        u : [
          ObjectID("506de30a8eebf7524342cb6c")
        ]
      }, function (err, n) {
        should.exist(err);
        return done();
      });
    });

  });
  

  describe("#ensureHash", function(){
    
    it('returns an identical hash for Notifications with identical details that were created at different times', function(done){
      var now = new Date(),
          options1 = {
            createdAt : now,
            gpi : ObjectID("51a7b69ca3b04db08057e047"),
            trigger : feBeUtils.NOTIFICATION_TRIGGERS.PHASE_ACTION,
            triggerDetails : {
              gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
              actionId : ObjectID("506de2f18eebf7524342cb27"),
              phaseName : "Seedling"
            },
            type : feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED,
            sl : [ ],
            r : {
              durationType : "days",
              duration : 1,
              timezone : "America/New_York"
            },
            tts : now,
            u : [
              ObjectID("506de30a8eebf7524342cb6c")
            ]
          },
          options2 = JSON.parse(JSON.stringify(options1)),
          notification1,
          notification2;
      

      notification1 = new Notification.model(options1);
      options2.createdAt = new Date(now.valueOf() + 2000);
      notification2 = new Notification.model(options2);
      notification1.ensureHash();
      notification2.ensureHash();

      notification1.hash.should.equal(notification2.hash);
      done();
    });

    
    it('returns a different hash for Notifications with different trigger details', function(done){
      var now = new Date(),
          options1 = {
            createdAt : now,
            gpi : ObjectID("51a7b69ca3b04db08057e047"),
            trigger : feBeUtils.NOTIFICATION_TRIGGERS.PHASE_ACTION,
            triggerDetails : {
              gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
              actionId : ObjectID("506de2f18eebf7524342cb27"),
              phaseName : "Seedling"
            },
            type : feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED,
            sl : [ ],
            r : {
              durationType : "days",
              duration : 1,
              timezone : "America/New_York"
            },
            tts : now,
            u : [
              ObjectID("506de30a8eebf7524342cb6c")
            ]
          },
          options2 = JSON.parse(JSON.stringify(options1)),
          notification1,
          notification2;
      

      notification1 = new Notification.model(options1);
      options2.triggerDetails.actionId = new ObjectID("506de2f18eeb000000000000");
      notification2 = new Notification.model(options2);
      notification1.ensureHash();
      notification2.ensureHash();

      notification1.hash.should.not.equal(notification2.hash);
      done();
    });    


  });

  
  describe("#getDisplay", function(){
    beforeEach(function(done){
      var self = this;
      
      async.parallel([
        function prepareNotification(innerCallback){
          Notification.model.create({
            "_id" : ObjectID("521edeb06179930400000015"), 
            "gpi" : ObjectID("51caf958f613580200000270"), 
            "trigger" : feBeUtils.NOTIFICATION_TRIGGERS.DEVICE_MISSING, 
            "triggerDetails" : { 
              "deviceId" : "000666809f76",
              "lastConnectionAt" : new Date("2013-08-29T12:00:00.000Z")
            }, 
            "tts" : null, 
            "type" : feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED, 
            "u" : [  ObjectID("506de30a8eebf7524342cb6c") ]
          }, function(err, notification){
            self.notification = notification;
            return innerCallback();   
          });
        },
        function prepareDevice(innerCallback){
          Device.model.update(
            { _id : "000666809f76" },
            { lastConnectionAt: new Date("2013-08-29T12:00:00.000Z") }, 
            function(err, device){
              self.device = device;
              return innerCallback();
            }
          );
        }
      ],
      function(err){
        return done();
      });
    });


    afterEach(function(done){
      var self = this;
      Notification.model.remove({_id : self.notification._id}, done);
    });


    describe("NOTIFICATION_TRIGGERS.DEVICE_MISSING", function(){
      
      it("handles email display", function(done){
        var self = this;
        should.exist(self.notification);
        should.exist(self.device);

        self.notification.getDisplays({
          secureAppUrl : "http://test.com",
          displayTypes : ['email']
        }, function(err, displays){
          should.not.exist(err);
          
          displays.email.should.include({ 
            subject: 'Bitponics Alert | Development Device 2013-06-13 Connection Dropped',
            bodyHtml: '<h1>Development Device 2013-06-13 seems to have dropped its connection.</h1>\n\n<p>We haven\'t heard from your device with the id 000666809f76 since Thursday, August 29th 2013, 8:00 am.</p>\n\n\n<p>It probably just needs a reset to get back on your wifi network. Unplug the device power and plug it back in.</p>\n\n\n<p>To see device details, click the link below. If you continue to have device connectivity issues, please let us know through our <a href="http://test.com/help">help page</a>. We\'ll help you resolve any issues ASAP.</p>\n\n<a class="btn" href="http://test.com/account/devices/000666809f76">Manage your devices</a>',
            bodyText: 'Development Device 2013-06-13 seems to have dropped its connection.\n\nWe haven\'t heard from your device with the id 000666809f76 since Thursday, August 29th 2013, 8:00 am.\n\nIt probably just needs a reset to get back on your wifi network. Unplug the device power and plug it back in.\n\nTo see device details, click the link below:\nhttp://test.com/account/devices/000666809f76\n\nIf you continue to have device connectivity issues, please let us know through our help page: http://test.com/help">. We\'ll help you resolve any issues ASAP.\n\n' 
          });

          return done();
        });
      });


      it("handles summary display", function(done){
        var self = this;
        should.exist(self.notification);
        should.exist(self.device);

        self.notification.getDisplays({
          secureAppUrl : "http://test.com",
          displayTypes : ['summary']
        }, function(err, displays){
          should.not.exist(err);
          
          displays.summary.should.equal("Development Device 2013-06-13 seems to have dropped its connection.");

          return done();
        });
      });


      it("handles detail display", function(done){
        var self = this;
        should.exist(self.notification);
        should.exist(self.device);

        self.notification.getDisplays({
          secureAppUrl : "http://test.com",
          displayTypes : ['detail']
        }, function(err, displays){
          should.not.exist(err);
          
          displays.detail.should.equal('<h1>Development Device 2013-06-13 seems to have dropped its connection.</h1>\n\n<p>We haven\'t heard from your device with the id 000666809f76 since Thursday, August 29th 2013, 8:00 am.</p>\n\n\n<p>It probably just needs a reset to get back on your wifi network. Unplug the device power and plug it back in.</p>\n\n\n<p>To see device details, click the link below. If you continue to have device connectivity issues, please let us know our <a href="http://test.com/help">help page</a>. We\'ll help you resolve any issues ASAP.</p>\n\n<a class="btn" href="http://test.com/account/devices/000666809f76">Manage your devices</a>');

          return done();
        });
      });      

    });
    

  });

  


});