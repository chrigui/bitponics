/*
 * File we've designated to contain root-level hooks.
 *
 * Filename doesn't matter; Mocha will detect the root-level methods
 * in any test file and execute as expected
 *
 * http://visionmedia.github.com/mocha/, search for '“root” level hooks'
 */

 var mongoose = require('mongoose'),
 mongoUrl = require('../config/mongo-config').urls.test,
 exec = require('child_process').exec;

/*
 * before Method
 *
 * The before method will execute every time Mocha is run. This
 * code will not run every time an individual test is run.
 */
 before(function(done){
  	// Connecting to a local test database or creating it on the fly
  	mongoose.connect(mongoUrl);
  	exec('db_init ' + mongoUrl + ' clear', 
  		function (error, stdout, stderr){
  			if (error) { console.log(error); return done(new Error(error));}
  			if (stderr) { console.log(stderr); return done(new Error(stderr));}
  			return done();
  		}
	);
});

/*
 * after Method
 *
 * Just like the before, after is run after Mocha has completed
 * running its queue.
 */
 after(function(done){
 	mongoose.connection.close();
 	done();
 });