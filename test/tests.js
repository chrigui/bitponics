var app = require('../app.js'),
nodeunit = require('nodeunit'),
httputil = nodeunit.utils.httputil,
testCase  = nodeunit.testCase
sinon = require('sinon'),
user = require('../models/user')(app),
zombie = require('zombie');

exports.test_user = testCase({
    setUp: function(callback) {
      newUser = undefined;
      //create test user with just email
      user.model.create({ email: "test@test.com" }, function(err, userObj){
        newUser = userObj;
        callback();
      });
    },

    tearDown: function(callback) {
      //clean up test user from db
      if(newUser){
        User.findById(newUser._id, function(err, userObj){
          userObj.remove();
        });
      }
      callback();
    },

    "Test email user create": function(test) {
      console.log(newUser);
      test.ok(newUser != undefined, "New user was created.");
      if(newUser){
        test.ok(newUser.email == "test@test.com", "New user email match.");
      }
      test.done();
    }
});

exports.test_user_fb = testCase({
    setUp: function(callback) {
      var userParams = {
          id: "id"
        , accessToken: ""
        , expires: ""
        , name: {
              full: ""
            , first: ""
            , last: ""
          }
        , alias: ""
        , gender: ""
        , email: "facebook@test.com"
        , timezone: ""
        , locale: ""
        , verified: ""
        , updatedTime: ""
      }
      newUser = undefined;
      //create test user with just email
      user.model.create(userParams, function(err, userObj){
        newUser = userObj;
        callback();  
      });
      
    },

    tearDown: function(callback) {
      //clean up test user from db
      if(newUser){
        User.findById(newUser._id, function(err, userObj){
          userObj.remove();
        });
      }
      callback();
    },

    "Test Facebook user create": function(test) {
      test.ok(newUser != undefined, "New user was created w/ FB info.");
      if(newUser){
        test.ok(newUser.email == "facebook@test.com", "New user email match.");
      }
      test.done();
    }
});

/*exports.test_user_password = testCase({
    setUp: function(callback) {
      newUser = undefined;
      //create test user with just email
      user.model.create({ email: "test@test.com" }, function(err, userObj){
        newUser = userObj;
        callback();
      });
    },

    tearDown: function(callback) {
      //clean up test user from db
      if(newUser){
        User.findById(newUser._id, function(err, userObj){
          userObj.remove();
        });
      }
      callback();
    },

    "Test password user create": function(test) {
      test.ok(newUser != undefined, "New user was created.");
      if(newUser){
        test.ok(newUser.email == "test@test.com", "New user email match.");
      }
      test.done();
    }
});*/

exports.test_home_page = testCase({
    setUp: function(callback) {
      //Browser.debug = true
      browser = new zombie();
      browser.runScripts = false
      callback();
    },

    tearDown: function(callback) {
      callback();
    },

    "Test home page load": function(test) {
	    test.expect(1);

    	browser.visit('http://bitponics.com', function() {
              //if(browser.errors){
              //  console.dir(browser.errors);
              //}
    	  test.ok(browser.success);
              test.done();
    	});

    }
});
