module.exports = {
	middleware : {
		ensureLoggedIn : function(req, res, next){
			if( !(req.user && req.user._id)){
				return res.redirect('/login?redirect=' + req.url);
			}
			next();
		},
    ensureDeviceLoggedIn : function(req, res, next){
      if( !(req.user && req.user._id)){
        var error = new Error("Invalid device request auth");
        error.status = 403; // TODO: should be a 401 but for some reason server is returning an empty response if it's a 401
        error.headers = {
          "WWW-Authenticate" : "BPN_DEVICE"
        };
        return next(error);
      }
      next();
    },
		ensureUserIsAdmin : function(req, res, next){
			if( !(req.user && req.user._id && req.user.admin)){
				return res.redirect('/login?redirect=' + req.url);
			}
			next();
		},
		/**
		 * References:
		 * http://stackoverflow.com/questions/7450940/automatic-https-connection-redirect-with-node-js-express
		 * http://stackoverflow.com/questions/13186134/node-js-express-and-heroku-how-to-handle-http-and-https
		 */
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