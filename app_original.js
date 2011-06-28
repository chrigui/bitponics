
/**
 * Module dependencies.
 */

var express = require('express');
//var mongo = require('mongodb');
//var server = new mongo.Server('staff.mongohq.com', '10000', {auto_reconnect: true});
//var db = new mongo.Db('app572244', server, {});
var couchd = require('couchdb');
var cradle = require('cradle');
var http = require('http');
var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});





// Database
var connection = new(cradle.Connection)('amitkumar.cloudant.com', 80, {
    secure: true,
	auth: { username: 'amitkumar', password: 't1tmscp3' }
});
var db = connection.database('bitponics');


db.get('vader', function (err, doc) {
    doc.name; // 'Darth Vader'
    console.log('something');
});

console.log('here');
/*
// MongoDB DB
db.open(function(err) {
    // if you need to authenticate, do it here (otherwise just omit the following line):
	if (err){console.log(err);}
	console.log('opened');
    db.authenticate('admin', 'testing!', function(err) {
console.log('here');
if (err) console.log(err);        
// now we're ready!
		db.collection('logs', function(err, col) {
		    col.save({ sensorType: 'temperature', time: new Date(), val: 1});
			console.log('saved1');
		});
    });
});
*/

// Routes

app.get('/dashboard', function(req, res){
	
	/*
	db.collection('logs', function(err, col) {
	    col.save({ sensorType: 'temperature', time: new Date(), val: 1});
		console.log('saved');
	});
	*/
	
  res.render('dashboard', {
    title: 'Express',
	locals : { temp: 1 }
  });
});

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});



var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Express server listening on port %d", app.address().port);
});



