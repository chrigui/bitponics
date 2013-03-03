var mongoose = require('mongoose'),
    Action = require('../models/action'),
    should = require('should'),
    moment = require('moment');


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

        it('returns an accurate timespan for a 3-state (aka "offset"), no-control cycle', function(done){
            var overallCycleTimespan,
                overallCycleTimespanAsHours,
                action = new Action.model({
                    description : 'test reminder to trigger at 8am every day',
                    cycle : {
                        states : [
                            {
                                durationType: 'hours',
                                duration: 8
                            },
                            {
                                message: "Check water level in seed tray. Make sure there's a thin layer at the bottom of the tray to last the seedlings through the day."
                            },
                            {
                                durationType : 'hours',
                                duration: 16
                            }
                        ],
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

        it('returns an accurate timespan for a 3-state (aka "offset"), has-control cycle', function(done){
            var overallCycleTimespan,
                overallCycleTimespanAsHours,
                action = new Action.model({
                    description : 'test offset control cycle',
                    control : '506de2fc8eebf7524342cb2d', // water pump
                    cycle : {
                        states : [
                            {
                                durationType: 'hours',
                                duration: 4,
                                controlValue : '0'
                            },
                            {
                                durationType: 'hours',
                                duration: 10,
                                controlValue : '1'
                            },
                            {
                                durationType : 'hours',
                                duration: 10,
                                controlValue : '0'

                            }
                        ],
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


    describe('getStateMessage', function(){
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
                action.getStateMessage(0).should.equal(mockMessage);
                done();
            });
        });

        it('generates a friendly ON message with duration when there\'s a control, non-zero controlValue & duration', function(done){
            var mockControlName = 'testControlName',
                action = new Action.model({
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
                action.getStateMessage(0, mockControlName).should.equal('Turn ' + mockControlName + ' on for 10 hours');
                done();
            });
        });

        it('generates a friendly ON message when there\'s a control, non-zero controlValue & no duration', function(done){
            var mockControlName = 'testControlName',
                action = new Action.model({
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
                action.getStateMessage(0, mockControlName).should.equal('Turn ' + mockControlName + ' on');
                done();
            });
        });

        it('generates a friendly OFF message with duration when there\'s a control, zero controlValue & duration', function(done){
            var mockControlName = 'testControlName',
                action = new Action.model({
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
                action.getStateMessage(0, mockControlName).should.equal('Turn ' + mockControlName + ' off for 10 hours');
                done();
            });
        });

        it('generates a friendly OFF message when there\'s a control, zero controlValue & no duration', function(done){
            var mockControlName = 'testControlName',
                action = new Action.model({
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
                action.getStateMessage(0, mockControlName).should.equal('Turn ' + mockControlName + ' off');
                done();
            });
        });
    });
});