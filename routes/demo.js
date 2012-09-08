
module.exports = function(app){
	app.get('/demo', function (req, res) {
		res.render('demo', {
	    	title: "Bitponics - Demo"
		});	
	});
};

