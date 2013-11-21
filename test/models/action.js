var mongooseConnection = require('../../config/mongoose-connection').open('test'),
	mongoose = require('mongoose'),
  Action = require('../../models/action'),
  should = require('should'),
  moment = require('moment'),
  i18nKeys = require('../../i18n/keys'),
  timezone = require('../../lib/timezone-wrapper');


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

describe('Action', function(){

  describe('virtual overallCycleTimespan property', function(){
    it('returns an accurate timespan of 0 for a single-state no-control cycle', function(done){
      var overallCycleTimespan,
        overallCycleTimespanAsMinutes,
        action = new Action.model({
          description : 'test action',
          cycle : {
            states : [
              {
                message : 'time to do something'
              }
            ]
          }
        });

      action.save(function(err){
        should.not.exist(err);
        overallCycleTimespan = action.overallCycleTimespan;
        overallCycleTimespan.should.equal(0);
        done();
      });
    });

    it('returns an accurate timespan of "infinite", aka 1 year, for a single-state has-control cycle', function(done){
      var overallCycleTimespan,
        overallCycleTimespanAsMinutes,
        action = new Action.model({
          description : 'test action',
          control : '506de2fc8eebf7524342cb2d', // water pump
          cycle : {
            states : [
              {
                message : 'turn on pump',
                controlValue : '1'
              }
            ]
          }
        });

      action.save(function(err){
        should.not.exist(err);
        overallCycleTimespan = action.overallCycleTimespan;
        overallCycleTimespan.should.equal(moment.duration(1, 'year').asMilliseconds());
        done();
      });
    });

    it('returns an accurate timespan for a 2-state repeating no-control cycle', function(done){
      var overallCycleTimespan,
        overallCycleTimespanAsMinutes,
        action = new Action.model({
          description : 'test action',
          control : '506de2fc8eebf7524342cb2d', // water pump
          cycle : {
            states : [
              {
                durationType: 'minutes',
                duration: 15,
                controlValue : '1'
              },
              {
                durationType : 'minutes',
                duration: 15,
                controlValue : '0'
              }
            ],
            repeat : true
          }
        });

      action.save(function(err){
        should.not.exist(err);
        overallCycleTimespan = action.overallCycleTimespan;
        overallCycleTimespan.should.equal(moment.duration(15, 'minutes').asMilliseconds() + moment.duration(15, 'minutes').asMilliseconds());
        overallCycleTimespanAsMinutes = moment.duration(overallCycleTimespan).asMinutes();
        overallCycleTimespanAsMinutes.should.equal(30);
        done();
      });
    });

    it('returns an accurate timespan for a 2-state non-repeating no-control cycle', function(done){
      var overallCycleTimespan,
        overallCycleTimespanAsMinutes,
        action = new Action.model({
          description : 'at 8:00am on day of phase start, remind me to do this action',
          cycle : {
            states : [
              {
                durationType: 'hours',
                duration: 8
              },
              {
                message : 'do this manual thing'
              }
            ]
          }
        });

      action.save(function(err){
        should.not.exist(err);
        overallCycleTimespan = action.overallCycleTimespan;
        overallCycleTimespan.should.equal(moment.duration(8, 'hours').asMilliseconds());
        done();
      });
    });

    it('returns an accurate timespan for an offset 2-state, no-control cycle', function(done){
      var overallCycleTimespan,
        overallCycleTimespanAsHours,
        action = new Action.model({
          description : 'test reminder to trigger at 8am every day',
          cycle : {
            states : [
              {
                message: "Check water level in seed tray. Make sure there's a thin layer at the bottom of the tray to last the seedlings through the day."
              },
              {
                durationType : 'hours',
                duration: 24
              }
            ],
            offset : {
              durationType: 'hours',
              duration: 8
            },
            repeat : true
          }
        });

      action.save(function(err){
        should.not.exist(err);
        overallCycleTimespan = action.overallCycleTimespan;
        overallCycleTimespan.should.equal(moment.duration(8, 'hours').asMilliseconds() + moment.duration(16, 'hours').asMilliseconds());
        overallCycleTimespanAsHours = moment.duration(overallCycleTimespan).asHours();
        overallCycleTimespanAsHours.should.equal(24);
        done();
      });
    });

    it('returns an accurate timespan for an offset 2-state, has-control cycle', function(done){
      var overallCycleTimespan,
        overallCycleTimespanAsHours,
        action = new Action.model({
          description : 'test offset control cycle',
          control : '506de2fc8eebf7524342cb2d', // water pump
          cycle : {
            states : [
              {
                durationType: 'hours',
                duration: 10,
                controlValue : '1'
              },
              {
                durationType : 'hours',
                duration: 14,
                controlValue : '0'
              }
            ],
            offset : {
              durationType: 'hours',
              duration: 4
            },
            repeat : true
          }
        });

      action.save(function(err){
        should.not.exist(err);
        overallCycleTimespan = action.overallCycleTimespan;
        overallCycleTimespan.should.equal(moment.duration(24, 'hours').asMilliseconds());
        done();
      });
    });

  }); // /virtual overallCycleTimespan property

/*
  describe('state message validation', function(){
    it('simply echoes messages when there\'s no control', function(done){
      var mockMessage = 'test message',
        action = new Action.model({
          description : 'test action',
          cycle : {
            states : [
              {
                durationType: 'hours',
                duration: 10,
                message: mockMessage
              }
            ]
          }
        });

      action.save(function(err){
        should.not.exist(err);
        action.cycle.states[0].message.should.equal(mockMessage);
        done();
      });
    });

    it('generates a friendly ON message with duration when there\'s a control, non-zero controlValue & duration', function(done){
      var action = new Action.model({
          description : 'test action',
          control : '506de2fc8eebf7524342cb2d', // water pump
          cycle : {
            states : [
              {
                durationType: 'hours',
                duration: 10,
                controlValue : '1'
              }
            ]
          }
        });

      action.save(function(err){
        should.not.exist(err);
        action.cycle.states[0].message.should.equal('Turn Water Pump on for 10 hours');
        done();
      });
    });

    it('generates a friendly ON message when there\'s a control, non-zero controlValue & no duration', function(done){
      var action = new Action.model({
          description : 'test action',
          control : '506de2fc8eebf7524342cb2d', // water pump
          cycle : {
            states : [
              {
                controlValue : '1'
              }
            ]
          }
        });

      action.save(function(err){
        should.not.exist(err);
        action.cycle.states[0].message.should.equal('Turn Water Pump on');
        done();
      });
    });

    it('generates a friendly OFF message with duration when there\'s a control, zero controlValue & duration', function(done){
      var action = new Action.model({
          description : 'test action',
          control : '506de2fc8eebf7524342cb2d', // water pump
          cycle : {
            states : [
              {
                durationType: 'hours',
                duration: 10,
                controlValue : '0'
              }
            ]
          }
        });

      action.save(function(err){
        should.not.exist(err);
        action.cycle.states[0].message.should.equal('Turn Water Pump off for 10 hours');
        done();
      });
    });

    it('generates a friendly OFF message when there\'s a control, zero controlValue & no duration', function(done){
      var action = new Action.model({
          description : 'test action',
          control : '506de2fc8eebf7524342cb2d', // water pump
          cycle : {
            states : [
              {
                controlValue : '0'
              }
            ]
          }
        });

      action.save(function(err){
        should.not.exist(err);
        action.cycle.states[0].message.should.equal('Turn Water Pump off');
        done();
      });
    });
  }); // /state message validation
*/

  describe('#isEquivalentTo', function(){

    it('returns false when description differs', function(done){
      var action1 = new Action.model({
        description : "desc 1"
      });
      var action2 = new Action.model({
        description : "desc 2"
      });

      var isEquivalent = Action.model.isEquivalentTo(action1, action2);
      isEquivalent.should.be.false;
      done();
    });


    it('returns false when control differs', function(done){
      var action1 = new Action.model({
        control : "506de2fc8eebf7524342cb2d" // water pump
      });
      var action2 = new Action.model({
        control : "506de2fc8eebf7524342cb2e" // humidifier
      });

      var isEquivalent = Action.model.isEquivalentTo(action1, action2);
      isEquivalent.should.be.false;
      done();
    });


    it('returns false when cycle.states.length differs', function(done){
      var action1 = new Action.model({
        description : "desc",
        cycle : {
          states : [
            {
              message : "message"
            }
          ]
        }
      });
      var action2 = new Action.model({
        description : "desc"
      });

      var isEquivalent = Action.model.isEquivalentTo(action1, action2);
      isEquivalent.should.be.false;
      done();
    });


    it('returns false when cycle.repeat differs', function(done){
      var action1 = new Action.model({
        description : "desc",
        cycle : {
          states : [
            {
              message : "message",
              duration : 1,
              durationType : 'minutes'
            },
            {
              message : "message",
              duration : 1,
              durationType : 'minutes'
            }
          ],
          repeat : true
        }
      });
      var action2 = new Action.model({
        description : "desc",
        cycle : {
          states : [
            {
              message : "message",
              duration : 1,
              durationType : 'minutes'
            },
            {
              message : "message",
              duration : 1,
              durationType : 'minutes'
            }
          ],
          repeat : false
        }
      });

      var isEquivalent = Action.model.isEquivalentTo(action1, action2);
      isEquivalent.should.be.false;
      done();
    });


    it('returns false when a cycle.state.controlValue differs', function(done){
      var action1 = new Action.model({
        description : "desc",
        control : "506de2fc8eebf7524342cb2e", // humidifier
        cycle : {
          states : [
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '1'
            },
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '0'
            }
          ],
          repeat : true
        }
      });
      var action2 = new Action.model({
        description : "desc",
        cycle : {
          states : [
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '0'
            },
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '1'
            }
          ],
          repeat : true
        }
      });

      var isEquivalent = Action.model.isEquivalentTo(action1, action2);
      isEquivalent.should.be.false;
      done();
    });


    it('returns false when a cycle.state.duration differs', function(done){
      var action1 = new Action.model({
        description : "desc",
        control : "506de2fc8eebf7524342cb2e", // humidifier
        cycle : {
          states : [
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '1'
            },
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '0'
            }
          ],
          repeat : true
        }
      });
      var action2 = new Action.model({
        description : "desc",
        cycle : {
          states : [
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '1'
            },
            {
              message : "message",
              duration : 2,
              durationType : 'minutes',
              controlValue : '0'
            }
          ],
          repeat : true
        }
      });

      var isEquivalent = Action.model.isEquivalentTo(action1, action2);
      isEquivalent.should.be.false;
      done();
    });


    it('returns false when a cycle.state.durationType differs', function(done){
      var action1 = new Action.model({
        description : "desc",
        control : "506de2fc8eebf7524342cb2e", // humidifier
        cycle : {
          states : [
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '1'
            },
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '0'
            }
          ],
          repeat : true
        }
      });
      var action2 = new Action.model({
        description : "desc",
        cycle : {
          states : [
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '1'
            },
            {
              message : "message",
              duration : 1,
              durationType : 'hours',
              controlValue : '0'
            }
          ],
          repeat : true
        }
      });

      var isEquivalent = Action.model.isEquivalentTo(action1, action2);
      isEquivalent.should.be.false;
      done();
    });

    it('returns false when a cycle.state.message differs', function(done){
      var action1 = new Action.model({
        description : "desc",
        control : "506de2fc8eebf7524342cb2e", // humidifier
        cycle : {
          states : [
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '1'
            },
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '0'
            }
          ],
          repeat : true
        }
      });
      var action2 = new Action.model({
        description : "desc",
        cycle : {
          states : [
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '1'
            },
            {
              message : "message2",
              duration : 1,
              durationType : 'minutes',
              controlValue : '0'
            }
          ],
          repeat : true
        }
      });

      var isEquivalent = Action.model.isEquivalentTo(action1, action2);
      isEquivalent.should.be.false;
      done();
    });

    it('returns true if the whole shebang\'s the same', function(done){
      var action1 = new Action.model({
        description : "desc",
        control : "506de2fc8eebf7524342cb2e", // humidifier
        cycle : {
          states : [
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '1'
            },
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '0'
            }
          ],
          repeat : true
        }
      });
      var action2 = new Action.model({
        description : "desc",
        control : "506de2fc8eebf7524342cb2e", // humidifier
        cycle : {
          states : [
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '1'
            },
            {
              message : "message",
              duration : 1,
              durationType : 'minutes',
              controlValue : '0'
            }
          ],
          repeat : true
        }
      });

      var isEquivalent = Action.model.isEquivalentTo(action1, action2);
      isEquivalent.should.be.true;
      done();
    });
  }); // /isEquivalentTo


  describe('pre-save validation', function(){

    it('returns an error if greater than 2 cycle states', function(done){
      var action = new Action.model({
        description : "attempted 2+3 week cycle",
        cycle: {
          states : [
            {
              duration: 2,
              durationType : 'weeks'
            },
            {
              message : "do this thing after 2 weeks"
            },
            {
              duration: 3,
              durationType : 'weeks'
            }
          ]
        }
      });

      action.save(function(err){
        should.exist(err);
        console.log(err);
        err.errors['cycle.states'].message.should.equal('Invalid number of cycle states. Cycles have 1 or 2 states (on/off).');
        done();
      });
    });


    it('returns an error if a control is specified, but no states exist', function(done){
      var action = new Action.model({
        description : "desc",
        control : "506de2fc8eebf7524342cb2e", // humidifier
        cycle: {
          states : []
        }
      });

      action.save(function(err){
        should.exist(err);
        console.log(err);
        err.errors.control.message.should.equal('An action with a control must define a cycle with 1 or 2 control states');
        done();
      });
    });


    it('returns an error if a control is specified, but not every state specifies a controlValue', function(done){
      var action = new Action.model({
        description : "desc",
        control : "506de2fc8eebf7524342cb2e", // humidifier
        cycle: {
          states : [{
            message: "msg"
          }]
        }
      });

      action.save(function(err){
        should.exist(err);
        err.message.should.equal(i18nKeys.get('If an action has a control, every cycle state must specify a control value'));
        done();
      });
    });


    it('returns an error if attempting to save an alternating-state cycle (with 2 states), but no states have a duration', function(done){
      var action = new Action.model({
        description : "desc",
        control : "506de2fc8eebf7524342cb2e", // humidifier
        cycle: {
          states : [
            {
              controlValue : "1"
            },
            {
              controlValue : "0"
            }
          ]
        }
      });

      action.save(function(err){
        should.exist(err);
        err.message.should.equal(i18nKeys.get('In a 2-state cycle, at least one state must have a duration defined'));
        done();
      });
    });
  }); // /pre-save validation


  describe('.convertDurationToMilliseconds', function(){

    it('handles durations for seconds', function(done){
      Action.model.convertDurationToMilliseconds(1, 'seconds').should.equal(1000);
      done();
    });

    it('handles durations for minutes', function(done){
      Action.model.convertDurationToMilliseconds(1, 'minutes').should.equal(1000 * 60);
      done();
    });

    it('handles durations for hours', function(done){
      Action.model.convertDurationToMilliseconds(1, 'hours').should.equal(1000 * 60 * 60);
      done();
    });

    it('handles durations for days', function(done){
      Action.model.convertDurationToMilliseconds(1, 'days').should.equal(1000 * 60 * 60 * 24);
      done();
    });

    it('handles durations for weeks', function(done){
      Action.model.convertDurationToMilliseconds(1, 'weeks').should.equal(1000 * 60 * 60 * 24 * 7);
      done();
    });

    it('handles durations for months', function(done){
      Action.model.convertDurationToMilliseconds(1, 'months').should.equal(1000 * 60 * 60 * 24 * 30);
      done();
    });

    it('handles non-existent duration', function(done){
      Action.model.convertDurationToMilliseconds().should.equal(0);
      done();
    });
  }); // /convertDurationToMilliseconds


  describe('.getCycleRemainder', function(){

    it('returns remainder of a repeating cycle in milliseconds, assuming cycle started at phase start and factoring in timezone, with a fromDate within the first cycle iteration', function(done){
      var userTimezone = "America/Los_Angeles",
          startDate = timezone("2013-01-01 08:00", userTimezone),
          fromDate = timezone("2013-01-01 10:30", userTimezone),
          mockGPIPhase = {
            startDate : startDate
          },
        action = new Action.model({
          description : "desc",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            offset : {
              duration : 6,
              durationType : 'hours'
            },
            states : [
              {
                duration : 10,
                durationType : 'hours',
                controlValue : '1'
              },
              {
                duration : 14,
                durationType : 'hours',
                controlValue : '0'
              }
            ],
            repeat : true
          }
        });

      // Since we have a 24-hour action cycle, and started at 10:30am, there should be 13.5 hours remaining
      Action.model.getCycleRemainder(fromDate, mockGPIPhase, action, userTimezone).should.equal(moment.duration(13.5, 'hours').asMilliseconds());

      done();
    });


    it('returns remainder of a repeating cycle in milliseconds, assuming cycle started at phase start and factoring in timezone, with a fromDate occurring after multiple cycle iterations', function(done){
      var userTimezone = "America/Los_Angeles",
        startDate = timezone("2013-01-01 08:00", userTimezone),
        fromDate = timezone("2013-01-20 10:45:30", userTimezone),
        mockGPIPhase = {
          startDate : startDate
        },
        action = new Action.model({
          description : "desc",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                duration : 15,
                durationType : 'minutes',
                controlValue : '0'
              },
              {
                duration : 15,
                durationType : 'minutes',
                controlValue : '1'
              }
            ],
            repeat : true
          }
        });

      // 30 minute cycle. fromDate at :45:30 means we should have 14.5 minutes left
      Action.model.getCycleRemainder(fromDate, mockGPIPhase, action, userTimezone).should.equal(moment.duration(14.5, 'minutes').asMilliseconds());

      done();
    });


    it('returns remainder of a non-repeating cycle in milliseconds, assuming cycle started at phase start and factoring in timezone', function(done){
      var userTimezone = "America/Los_Angeles",
        startDate = timezone("2013-01-01 08:00", userTimezone),
        fromDate = timezone("2013-01-21 00:00", userTimezone),
        mockGPIPhase = {
          startDate : startDate
        },
        action = new Action.model({
          description : "desc",
          cycle : {
            states : [
              {
                duration : 4,
                durationType : 'weeks'
              },
              {
                message : "Refill the reservoir"
              }
            ]
          }
        });

      // from 20 days into the phase, 28-day action
      Action.model.getCycleRemainder(fromDate, mockGPIPhase, action, userTimezone).should.equal(moment.duration(8, 'days').asMilliseconds());

      done();
    });

  }); // /getCycleRemainder


  
  describe('.getCurrentControlValue', function(){

    it('returns current controlValue a repeating cycle, assuming cycle started at phase start and factoring in timezone, with a fromDate within the first cycle iteration', function(done){
      var userTimezone = "America/Los_Angeles",
          startDate = timezone("2013-01-01 08:00", userTimezone),
          fromDate = timezone("2013-01-01 10:30", userTimezone),
          mockGPIPhase = {
            startDate : startDate
          },
        action = new Action.model({
          description : "desc",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                duration : 10,
                durationType : 'hours',
                controlValue : '1'
              },
              {
                duration : 14,
                durationType : 'hours',
                controlValue : '0'
              }
            ],
            offset: {
              duration : 6,
              durationType : 'hours'
            },
            repeat : true
          }
        });

      // Since we have a 24-hour action cycle, and started at 10:30am, there should be 13.5 hours remaining, which means we're in states[1]
      Action.model.getCurrentControlValue(fromDate, mockGPIPhase, action, userTimezone).should.equal(1);

      done();
    });

    it('factors in offset value when from date is WITHIN the initial offset', function(done){
      var userTimezone = "America/Los_Angeles",
          startDate = timezone("2013-01-01 08:00", userTimezone),
          fromDate = timezone("2013-01-01 10:30", userTimezone),
          mockGPIPhase = {
            startDate : startDate
          },
        action = new Action.model({
          description : "desc",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                duration : 18,
                durationType : 'hours',
                controlValue : '1'
              },
              {
                duration : 6,
                durationType : 'hours',
                controlValue : '0'
              }
            ],
            offset : {
              durationType : 'hours',
              duration : 12
            },
            repeat : true
          }
        });

      // Since we have a 24-hour action cycle, and started at 10:30am, there should be 13.5 hours remaining, which means we're in states[1]
      Action.model.getCurrentControlValue(fromDate, mockGPIPhase, action, userTimezone).should.equal(0);

      done();
    });

    it('factors in offset value when from date is AFTER the initial offset', function(done){
      var userTimezone = "America/Los_Angeles",
          startDate = timezone("2013-01-01 08:00", userTimezone),
          fromDate = timezone("2013-01-01 10:30", userTimezone),
          mockGPIPhase = {
            startDate : startDate
          },
        action = new Action.model({
          description : "desc",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                duration : 18,
                durationType : 'hours',
                controlValue : '1'
              },
              {
                duration : 6,
                durationType : 'hours',
                controlValue : '0'
              }
            ],
            offset : {
              durationType : 'hours',
              duration : 8
            },
            repeat : true
          }
        });

      // Since we have a 24-hour action cycle, and started at 10:30am, there should be 13.5 hours remaining, which means we're in states[1]
      Action.model.getCurrentControlValue(fromDate, mockGPIPhase, action, userTimezone).should.equal(1);

      done();
    });

    it('factors in offset value when from date is AFTER the initial offset (Different timezone)', function(done){
      var userTimezone = "America/New_York",
          startDate = timezone("2013-01-01 08:00", userTimezone),
          fromDate = timezone("2013-01-01 10:30", userTimezone),
          mockGPIPhase = {
            startDate : startDate
          },
        action = new Action.model({
          description : "desc",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                duration : 18,
                durationType : 'hours',
                controlValue : '1'
              },
              {
                duration : 6,
                durationType : 'hours',
                controlValue : '0'
              }
            ],
            offset : {
              durationType : 'hours',
              duration : 8
            },
            repeat : true
          }
        });

      // Since we have a 24-hour action cycle, and started at 10:30am, there should be 13.5 hours remaining, which means we're in states[1]
      Action.model.getCurrentControlValue(fromDate, mockGPIPhase, action, userTimezone).should.equal(1);

      done();
    });

   it('factors in offset value when from date is AFTER the initial offset (Different date)', function(done){
      var userTimezone = "America/New_York",
          startDate = timezone("2013-01-01 08:00", userTimezone),
          fromDate = timezone("2013-02-01 10:30", userTimezone),
          mockGPIPhase = {
            startDate : startDate
          },
        action = new Action.model({
          description : "desc",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                duration : 18,
                durationType : 'hours',
                controlValue : '1'
              },
              {
                duration : 6,
                durationType : 'hours',
                controlValue : '0'
              }
            ],
            offset : {
              durationType : 'hours',
              duration : 8
            },
            repeat : true
          }
        });

      // Since we have a 24-hour action cycle, and started at 10:30am, there should be 13.5 hours remaining, which means we're in states[1]
      Action.model.getCurrentControlValue(fromDate, mockGPIPhase, action, userTimezone).should.equal(1);

      done();
    });
   it('factors in offset value when from date is AFTER the initial offset (Different date)', function(done){
      var userTimezone = "America/New_York",
          startDate = timezone("2013-01-01 08:00", userTimezone),
          fromDate = timezone("2013-02-01 10:30", userTimezone),
          mockGPIPhase = {
            startDate : startDate
          },
        action = new Action.model({
          description : "desc",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                duration : 18,
                durationType : 'hours',
                controlValue : '1'
              },
              {
                duration : 6,
                durationType : 'hours',
                controlValue : '0'
              }
            ],
            offset : {
              durationType : 'hours',
              duration : 8
            },
            repeat : true
          }
        });

      Action.model.getCurrentControlValue(fromDate, mockGPIPhase, action, userTimezone).should.equal(1);

      done();
    });


   it('factors in offset value when from date is AFTER the initial offset (overnight cycle)', function(done){
      var userTimezone = "America/New_York",
          startDate = timezone("2013-01-01 08:00", userTimezone),
          fromDate = timezone("2013-02-01 01:30", userTimezone),
          mockGPIPhase = {
            startDate : startDate
          },
        action = new Action.model({
          description : "desc",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                duration : 18,
                durationType : 'hours',
                controlValue : '1'
              },
              {
                duration : 6,
                durationType : 'hours',
                controlValue : '0'
              }
            ],
            offset : {
              durationType : 'hours',
              duration : 8
            },
            repeat : true
          }
        });

      
      Action.model.getCurrentControlValue(fromDate, mockGPIPhase, action, userTimezone).should.equal(1);

      done();
    });

    it('factors in offset value when from date is AFTER the initial offset (overnight cycle) reverse', function(done){
      var userTimezone = "America/New_York",
          startDate = timezone("2013-01-01 08:00", userTimezone),
          fromDate = timezone("2013-02-01 01:30", userTimezone),
          mockGPIPhase = {
            startDate : startDate
          },
        action = new Action.model({
          description : "desc",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                duration : 18,
                durationType : 'hours',
                controlValue : '0'
              },
              {
                duration : 6,
                durationType : 'hours',
                controlValue : '1'
              }
            ],
            offset : {
              durationType : 'hours',
              duration : 8
            },
            repeat : true
          }
        });

      
      Action.model.getCurrentControlValue(fromDate, mockGPIPhase, action, userTimezone).should.equal(0);

      done();
    });

    it('Always returns a single state value', function(done){
      var userTimezone = "America/New_York",
          startDate = timezone("2013-01-01 08:00", userTimezone),
          fromDate = timezone("2013-02-01 01:30", userTimezone),
          mockGPIPhase = {
            startDate : startDate
          },
        action = new Action.model({
          description : "desc",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                controlValue : '1'
              }
            ]
          }
        });

      
      Action.model.getCurrentControlValue(fromDate, mockGPIPhase, action, userTimezone).should.equal(1);

      done();
    });

}); // /.getCurrentControlValue


  describe('.getDeviceCycleFormat', function(){

    it('handles a no-state cycle', function(done){
      var action = new Action.model({
          description : "desc",
          cycle : {
            states : []
          }
        }),
        expectedResult = {
          offset : 0,
          value1 : 0,
          duration1 : 0,
          value2 : 0,
          duration2 : 0
        };

      Action.model.getDeviceCycleFormat(action.cycle).should.include(expectedResult);
      done();
    });

    it('parses a single-state cycle as an infinite duration of the state\'s controlValue', function(done){
      var action = new Action.model({
          description : "Turn something on. And leave it on!",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                controlValue : '1'
              }
            ]
          }
        }),
        expectedResult = {
          offset : 0,
          value1 : 1,
          duration1 : 1,
          value2 : 1,
          duration2 : 1
        };

      Action.model.getDeviceCycleFormat(action.cycle).should.include(expectedResult);
      done();
    });

    it('handles a alternating (2-state) cycle', function(done){
      var action = new Action.model({
          description : "Turn something on. And then off. Repeat. Foreverrrrr",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                duration: 1,
                durationType : 'hours',
                controlValue : '1'
              },
              {
                duration: 1,
                durationType : 'hours',
                controlValue : '0'
              }
            ],
            repeat : true
          }
        }),
        expectedResult = {
          offset : 0,
          value1 : 1,
          duration1 : (60 * 60 * 1000),
          value2 : 0,
          duration2 : (60 * 60 * 1000)
        };

      Action.model.getDeviceCycleFormat(action.cycle).should.include(expectedResult);
      done();
    });


    it('handles a alternating (2-state) cycle and echoes the offset', function(done){
      var action = new Action.model({
          description : "Turn something on. And then off. Repeat. Foreverrrrr",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                duration: 1,
                durationType : 'hours',
                controlValue : '1'
              },
              {
                duration: 1,
                durationType : 'hours',
                controlValue : '0'
              }
            ],
            repeat : true
          }
        }),
        offset = 100,
        expectedResult = {
          offset : 100,
          value1 : 1,
          duration1 : (60 * 60 * 1000),
          value2 : 0,
          duration2 : (60 * 60 * 1000)
        };

      Action.model.getDeviceCycleFormat(action.cycle, offset).should.include(expectedResult);
      done();
    });


    it('handles an offset alternating 2-state cycle', function(done){
      var action = new Action.model({
          description : "Turn something on. And then off. Repeat. Foreverrrrr",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                duration: 2,
                durationType : 'hours',
                controlValue : '0'
              },
              {
                duration: 5,
                durationType : 'hours',
                controlValue : '1'
              }
            ],
            offset : {
              durationType : 'hours',
              duration : 1
            },
            repeat : true
          }
        }),

      
      // Basically we want it to obey the Action by doing starting states[0] at a 1-hour
      // offset, meaning we start with 1 hour of states[1], then begin a standard cycle loop

        expectedResult = {
          offset : (1 * 60 * 60 * 1000), // 1 hour
          value1 : 0,
          duration1 : (2 * 60 * 60 * 1000), // 2 hours
          value2 : 1,
          duration2 : (5 * 60 * 60 * 1000) // 5 hours
        };

      Action.model.getDeviceCycleFormat(action.cycle).should.include(expectedResult);
      done();
    });


    it('handles an offset alternating 2-state cycle, with an additional offset', function(done){
      var action = new Action.model({
          description : "Turn something on. And then off. Repeat. Foreverrrrr",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                duration: 2,
                durationType : 'hours',
                controlValue : '0'
              },
              {
                duration: 5,
                durationType : 'hours',
                controlValue : '1'
              }
            ],
            offset : {
              duration: 1,
              durationType : 'hours'
            },
            repeat : true
          }
        }),


        // Basically we want it to obey the Action by doing starting states[0] at a 1-hour
        // offset, meaning we start with 1 hour of states[1], then begin a standard cycle loop
        // And it should be augmented by the offset we pass in

        offset = 100,
        expectedResult = {
          offset : (action.cycle.offset.duration * 60 * 60 * 1000) + offset,
          value1 : 0,
          duration1 : (2 * 60 * 60 * 1000), // 2 hours
          value2 : 1,
          duration2 : (5 * 60 * 60 * 1000), // 5 hours
        };

      Action.model.getDeviceCycleFormat(action.cycle, offset).should.include(expectedResult);
      done();
    });

  }); // /getDeviceCycleFormat


  describe('.updateCycleTemplateWithStates', function(){

    it('interpolates device-formatted cycle values into a string template', function(done){
      var cycleTemplate = '{offset},{value1},{duration1},{value2},{duration2}',
          action = new Action.model({
          description : "Turn something on. And then off. Repeat. Foreverrrrr",
          control : "506de2fc8eebf7524342cb2e", // humidifier
          cycle : {
            states : [
              {
                duration: 2,
                durationType : 'hours',
                controlValue : '0'
              },
              {
                duration: 5,
                durationType : 'hours',
                controlValue : '1'
              }
            ],
            offset : {
              duration: 1,
              durationType : 'hours',
            },
            repeat : true
          }
        }),

      // Expected result is that we have a 5-hour total duration for state1 and 2-hour for state2,
      // and that we tell the firmware to start the cycle so that there's only 1 hour left in
      // its first iteration on state1.
      // Basically we want it to obey the Action by doing 1 hour at state1, then 2 hours at state2, and then from there on out
      // doing a (5-hour state1, 2-hour state2) cycle
        offset = 100,
        expectedResult = {
          offset : (action.cycle.offset.duration * 60 * 60 * 1000) + offset,
          value1 : 0,
          duration1 : (2 * 60 * 60 * 1000), // 2 hours
          value2 : 1,
          duration2 : (5 * 60 * 60 * 1000), // 5 hours
        };

      expectedResult.cycleString =
        expectedResult.offset  + ',' +
        expectedResult.value1  + ',' +
        expectedResult.duration1 + ',' +
        expectedResult.value2 + ',' +
        expectedResult.duration2;

      var result = Action.model.updateCycleTemplateWithStates(cycleTemplate, action.cycle, offset);
      result.should.include(expectedResult);

      done();
    });

  }); // /updateCycleTemplateWithStates


  describe(".createNewIfUserDefinedPropertiesModified", function(){

    it("creates a new Action if _id isn't a valid ObjectId", function(done){
      var submittedAction = {
        _id : "nonsense",
        description : "do something"
      };

      Action.model.createNewIfUserDefinedPropertiesModified(
        {
          action : submittedAction

        },
        function(err, validatedAction){
          should.not.exist(err);
          should.exist(validatedAction);

          validatedAction.description.should.equal(submittedAction.description);

          done();
        }
      )
    });

    it("creates a new Action if _id matches an existing Action but rest of properties don't match", function(done){
      var submittedAction = {
        _id : "506de2fb8eebf7524342cb28",
        description : "do something"
      };

      Action.model.createNewIfUserDefinedPropertiesModified(
        {
          action : submittedAction

        },
        function(err, validatedAction){
          should.not.exist(err);
          should.exist(validatedAction);

          validatedAction._id.toString().should.not.equal(submittedAction._id);
          validatedAction.description.should.equal(submittedAction.description);

          done();
        }
      )
    });

    it("returns the pre-existing Action if _id and all other properties match", function(done){
      var submittedAction = {
        _id : "506de2fb8eebf7524342cb28",
        description: "Turn lights on",
        control: "506de2fd8eebf7524342cb32",
        cycle: {
          states: [
            {
              controlValue: '1'
            }
          ]
        }
      };

      Action.model.createNewIfUserDefinedPropertiesModified(
        {
          action : submittedAction
        },
        function(err, validatedAction){
          should.not.exist(err);
          should.exist(validatedAction);

          
          Action.model.findById(validatedAction._id)
          .exec(function(err, originalAction){
            should.not.exist(err);
            should.exist(originalAction);

            validatedAction._id.toString().should.equal(originalAction._id.toString());
            validatedAction.description.should.equal(originalAction.description);
            validatedAction.control.toString().should.equal(originalAction.control.toString());
            //validatedAction.cycle.should.eql(originalAction.cycle, "cycle should be equal");
            validatedAction.cycle.states.forEach(function(state, index){
              should.equal(state.message, originalAction.cycle.states[index].message, "each cycle state message should be equal");
              should.equal(state.controlValue, originalAction.cycle.states[index].controlValue, "each cycle state controlValue should be equal");
              should.equal(state.duration, originalAction.cycle.states[index].duration, "each cycle state duration should be equal");
              should.equal(state.durationType, originalAction.cycle.states[index].durationType, "each cycle state durationType should be equal");
            });
            done();
          });
        }
      )
    });
  }); // /.createNewIfUserDefinedPropertiesModified


});