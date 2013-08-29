var mongooseConnection = require('../../config/mongoose-connection').open('test'),
	mongoose = require('mongoose'),
  ObjectID = require('mongodb').ObjectID,
  Notification = require('../../models/notification'),
  Device = require('../../models/device'),
  should = require('should'),
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
        type : 'actionNeeded'
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
        type : 'actionNeeded'
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

  it('Create new notification', function(done){
    var now = new Date(),
      log = new Notification.model.create({
        gpi : ObjectID("51a7b69ca3b04db08057e047"),
        trigger : "phase-action",
        triggerDetails : {
          gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
          actionId : ObjectID("506de2f18eebf7524342cb27"),
          phaseName : "Seedling"
        },
        _id : ObjectID("5203aba6cddbb70000000014"),
        type : "actionNeeded",
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
        trigger : "phase-action",
        triggerDetails : {
          gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
          actionId : ObjectID("506de2f18eebf7524342cb27"),
          phaseName : "Seedling"
        },
        _id : ObjectID("5203aba6cddbb70000000014"),
        type : "actionNeeded",
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
      log2 = {},
      log1 = new Notification.model.create(options, function (err, n) {
        should.not.exist(err);
        should.exist(n);
        n.should.have.property('_id');
        log2 = new Notification.model.create(options, function (err, n2) {
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
    var now = new Date(),
      log = new Notification.model.create({
        gpi : new ObjectID(),
        trigger : "phase-action",
        triggerDetails : {
          gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
          actionId : ObjectID("506de2f18eebf7524342cb27"),
          phaseName : "Seedling"
        },
        _id : new ObjectID(),
        type : "actionNeeded",
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
    var now = Date.now(),
      log = new Notification.model.create({
        gpi : new ObjectID(),
        trigger : "phase-action",
        triggerDetails : {
          gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
          actionId : ObjectID("506de2f18eebf7524342cb27"),
          phaseName : "Seedling"
        },
        _id : new ObjectID(),
        type : "actionNeeded",
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
    var now = new Date(),
      log = new Notification.model.create({
        gpi : new ObjectID(),
        trigger : "phase-action",
        triggerDetails : {
          gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
          actionId : ObjectID("506de2f18eebf7524342cb27"),
          phaseName : "Seedling"
        },
        _id : new ObjectID(),
        type : "actionNeeded",
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
    var now = new Date(),
      log = new Notification.model.create({
        gpi : new ObjectID(),
        trigger : "phase-action",
        triggerDetails : {
          gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
          actionId : ObjectID("506de2f18eebf7524342cb27"),
          phaseName : "Seedling"
        },
        _id : new ObjectID(),
        type : "actionNeeded",
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
    var now = new Date(),
      log = new Notification.model.create({
        gpi : new ObjectID(),
        trigger : "phase-action",
        triggerDetails : {
          gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
          actionId : ObjectID("506de2f18eebf7524342cb27"),
          phaseName : "Seedling"
        },
        _id : new ObjectID(),
        type : "actionNeeded",
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

  
  describe("#getDisplay", function(){
    beforeEach(function(done){
      var self = this;
      
      async.parallel([
        function prepareNotification(innerCallback){
          Notification.model.create({
            "_id" : ObjectID("521edeb06179930400000015"), 
            "gpi" : ObjectID("51caf958f613580200000270"), 
            "trigger" : "device-missing", 
            "triggerDetails" : { 
              "deviceId" : "000666809f76"
            }, 
            "tts" : null, 
            "type" : "actionNeeded", 
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

        self.notification.getDisplay({
          secureAppUrl : "http://test.com",
          displayType : 'email'
        }, function(err, display){
          should.not.exist(err);
          
          display.should.include({ 
            subject: 'Bitponics Alert | Development Device 2013-06-13 Connection Dropped',
            bodyHtml: '<h1>Development Device 2013-06-13 seems to have dropped its connection.</h1>\n\n<p>We haven\'t heard from your device with the id 000666809f76 since Thursday, August 29th 2013, 8:00 am.</p>\n\n\n<p>It probably just needs a reset to get back on your wifi network. Unplug the device power and plug it back in.</p>\n\n\n<p>To see device details, click the link below. If you continue to have device connectivity issues, please let us know our <a href="http://test.com/help">help page</a>. We\'ll help you resolve any issues ASAP.</p>\n\n<a class="btn" href="http://test.com/account/devices/000666809f76">Manage your devices</a>',
            bodyText: 'Development Device 2013-06-13 seems to have dropped its connection.\n\nWe haven\'t heard from your device with the id 000666809f76 since Thursday, August 29th 2013, 8:00 am.\n\nIt probably just needs a reset to get back on your wifi network. Unplug the device power and plug it back in.\n\nTo see device details, click the link below:\nhttp://test.com/account/devices/000666809f76\n\nIf you continue to have device connectivity issues, please let us know through our help page: http://test.com/help">. We\'ll help you resolve any issues ASAP.\n\n' 
          });

          return done();
        });
      });


      it("handles summary display", function(done){
        var self = this;
        should.exist(self.notification);
        should.exist(self.device);

        self.notification.getDisplay({
          secureAppUrl : "http://test.com",
          displayType : 'summary'
        }, function(err, display){
          should.not.exist(err);
          
          display.should.equal("Development Device 2013-06-13 seems to have dropped its connection.");

          return done();
        });
      });


      it("handles detail display", function(done){
        var self = this;
        should.exist(self.notification);
        should.exist(self.device);

        self.notification.getDisplay({
          secureAppUrl : "http://test.com",
          displayType : 'detail'
        }, function(err, display){
          should.not.exist(err);
          
          display.should.equal('<h1>Development Device 2013-06-13 seems to have dropped its connection.</h1>\n\n<p>We haven\'t heard from your device with the id 000666809f76 since Thursday, August 29th 2013, 8:00 am.</p>\n\n\n<p>It probably just needs a reset to get back on your wifi network. Unplug the device power and plug it back in.</p>\n\n\n<p>To see device details, click the link below. If you continue to have device connectivity issues, please let us know our <a href="http://test.com/help">help page</a>. We\'ll help you resolve any issues ASAP.</p>\n\n<a class="btn" href="http://test.com/account/devices/000666809f76">Manage your devices</a>');

          return done();
        });
      });      

    });
    

  });

  // TODO: need to figure out error for below test:
  // ReferenceError: c is not defined
  //     at Context.<anonymous> (/Users/jack/Dropbox/dev/bitponics/test/models/notification.js:324:17)

  // it('clearPendingNotifications test', function(done){
  //   var now = Date.now(),
  //     log = new c.create({
  //       gpi : new ObjectID(),
  //       trigger : "phase-action",
  //       triggerDetails : {
  //         gpPhaseId : ObjectID("506de30c8eebf7524342cb72"),
  //         actionId : ObjectID("506de2f18eebf7524342cb27"),
  //         phaseName : "Seedling"
  //       },
  //       _id : new ObjectID(),
  //       type : "actionNeeded",
  //       sl : [ ],
  //       r : {
  //         durationType : "days",
  //         duration : 1,
  //         timezone : "America/New_York"
  //       },
  //       tts : new Date(),
  //       u : [
  //         ObjectID("506de30a8eebf7524342cb6c")
  //       ],
  //       c : false
  //     }, function (err, n) {
  //       should.not.exist(err);

  //       Notification.model.clearPendingNotifications({env: 'bitponics-test'}, function(err, count){
  //         if (err) { console.log(err); }
  //         should.not.exist(err);
  //         should.exist(count);
  //         count.should.equal(1);
  //         // var finishedEnvironmentAt = moment();
  //         // winston.info(environment + ' ModelUtils.clearPendingNotifications started at ' + now.format() + ', ended at ' + finishedEnvironmentAt.format() + ', duration ' + now.diff(finishedEnvironmentAt) + 'ms');
  //         // winston.info((count || 0) + " records affected");
  //         return done();
  //       });
  //     });
  // });


});