var mongoose = require('mongoose'),
User = require('../models/user').model,
exec = require('child_process').exec,
should = require('should'),
mongoUrl = 'mongodb://localhost/bitponics_test';

// Connecting to a local test database or creating it on the fly
mongoose.connect(mongoUrl);

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
 describe('User', function(){
 	var currentUser = null;

  /*
   * before Method
   *
   * The before method will execute every time Mocha is run. This
   * code will not run every time an individual test is run.
   */
   before(function(done){
   	exec('db_init ' + mongoUrl + ' clear', 
   		function (error, stdout, stderr){
   			if (error) { return done(new Error(error));}
   			if (stderr) { return done(new Error(stderr));}
   			return done();
   		});
   });

  /*
   * after Method
   *
   * Just like the before, after is run after Mocha has completed
   * running it's queue.
   */
   after(function(done){
   	done();
   });


 	/*
   * beforeEach Method
   *
	 * Run before each test.
	 * Create an active user.
	 */
	 beforeEach(function(done){
	 	User.createUserWithPassword({
		 		email : 'test@bitponics.com',
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
		 	done
	 	);
	 });


   /*
    * afterEach method
    *
    * Run after each test.
    * Remove the test user.
    */
    afterEach(function(done){
    	User.remove({email: 'test@bitponics.com'}, done);
    });


    it('creates a new user', function(done){
    	User.findOne({ email : 'test@bitponics.com'},
    		function(err, user){
    			should.not.exist(err);
					should.exist(user);
		  		user.email.should.eql('test@bitponics.com');
		  		done();
    		});

  	});


    it('authenticates a user by email and password', function(done){
    	User.authenticate('test@bitponics.com', '8bitpass', function(err, user){
    		should.not.exist(err);
				should.exist(user);
	  		user.email.should.eql('test@bitponics.com');
	  		done();
    	})
    });


		it('gets a user by public device key', function(done){
    	User.findOne({email : 'test@bitponics.com'},
    		function(err, user){
    			should.not.exist(err);
					should.exist(user);
    			User.getByPublicDeviceKey(user.deviceKey.public, function(err, nestedUser){
    				should.not.exist(err);
						should.exist(nestedUser);
						(nestedUser._id.equals(user._id)).should.be.ok;
						done();
    			});	
    		});
    });


		it('gets a user by public api key', function(done){
    	User.findOne({email : 'test@bitponics.com'},
    		function(err, user){
    			should.not.exist(err);
					should.exist(user);
    			User.getByPublicApiKey(user.apiKey.public, function(err, nestedUser){
    				should.not.exist(err);
						should.exist(nestedUser);
						(nestedUser._id.equals(user._id)).should.be.ok;
						done();
    			});	
    		});
    });

  });