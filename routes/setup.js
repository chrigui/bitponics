module.exports = function(app){
	app.get('/setup', function (req, res){
	  res.render('setup', {
	    title: 'Bitponics Device Setup',
	    className : 'setup'
	  });

	});
};