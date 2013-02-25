module.exports = {
	middleware : {
		ensureLoggedIn : function(req, res, next){
			if( !(req.user && req.user.id)){
				return res.redirect('/login?redirect=' + req.url);
			}
			next();
		},
		ensureUserIsAdmin : function(req, res, next){
			if( !(req.user && req.user.id && req.user.admin)){
				return res.redirect('/login?redirect=' + req.url);
			}
			next();
		},
		ensureSecure : (function(){
			var app = require('../app');
			if (app.settings.env === 'local'){
				return function(req, res, next){
					if (req.secure){
						return next();
					}
					res.redirect("https://" + req.headers.host + req.url); 
				}
			} else {
				// else, assumed to be hosted on heroku
				return function(req, res, next){
					if (req.headers['x-forwarded-proto'] === 'https'){
						return next();
					}
					res.redirect("https://" + req.headers.host + req.url); 
				}
			}
		}())
	}
};