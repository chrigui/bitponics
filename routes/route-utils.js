module.exports = {
	middleware : {
		ensureLoggedIn : function(req, res, next){
			if( !(req.user && req.user.id)){
				return res.redirect('/login?redirect=' + req.originalUrl);
			}
			next();
		}
	}
};