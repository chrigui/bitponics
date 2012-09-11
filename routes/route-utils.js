exports = {
	ensureAuthenticated : function(res, req, next){
		if (req.isAuthenticated()) { return next(); }
  		res.redirect('/login')
	}
};