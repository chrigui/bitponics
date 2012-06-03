//var app = require('../app');
/*
 * GET home page.
 */
module.exports = function(app){
	return {
		index : function (req, res) {
			res.render('dashboard', {
		    	title: "Bitponics - Dashboard",
			    appUrl : app.config.appUrl
			});
		}
	};
};

