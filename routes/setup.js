module.exports = function(app){
	app.get('/setup', function (req, res){
	  var locals = {
	    title: 'Bitponics Device Setup',
	    className : 'setup'
	  };

	  res.render('setup', locals);

	});
};