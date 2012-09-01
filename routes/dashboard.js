
module.exports = function(app){
	app.get('/dashboard', function (req, res) {
		res.render('dashboard', {
	    	title: "Bitponics - Dashboard",
		    appUrl : app.config.appUrl
		});
	});

	app.get('/dashboard-demo', function (req, res) {
		res.render('dashboard-demo', {
	    	title: "Bitponics - Dashboard Demo",
		    appUrl : app.config.appUrl
		});	
	});
};

