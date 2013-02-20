var routeUtils = require('./route-utils');
module.exports = function(app){
	app.get('/demo', routeUtils.middleware.ensureLoggedIn, function (req, res) {
		res.render('demo', {
	    	title: "Bitponics - Demo"
		});	
	});
};

