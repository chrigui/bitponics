var mongooseConnection = require('../../config/mongoose-connection').open('test'),
	mongoose = require('mongoose'),
  ObjectID = require('mongodb').ObjectID,
  Notification = require('../../models/notification'),
  should = require('should');


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
    var now = Date.now(),
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
        tts : "2013-08-08T14:31:02.788Z",
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
    var now = Date.now(),
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
        tts : "2013-08-08T14:31:02.788Z",
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
        tts : new Date((new Date()).valueOf() - 30 * 1000),
        u : [
          ObjectID("506de30a8eebf7524342cb6c")
        ]
      }, function (err, n) {
        should.exist(err);
        return done();
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