module.exports = function(app){
	app.get('/styleguide', function(req, res) {
	  res.render('styleguide', {
	    title: 'Styleguide',
	    layout: __dirname + "/views/jade/styleguide-layout.jade",
	    pretty: true
	  })
	});
};
