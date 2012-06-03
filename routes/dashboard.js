//var app = require('../app');
/*
 * GET home page.
 */
module.exports = function(app){
	return {
		index : function (req, res) {
			console.log('Dashboard index');
			console.log(app.config);
			res.render('dashboard', {
		    	title: "Bitponics - Dashboard",
			    appUrl : app.config.appUrl
			});
		}
	};
};

