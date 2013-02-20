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
		}
	}
};