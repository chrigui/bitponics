var UserModel = require('../models/user').model,
	winston = require('winston'),
	passport = require('passport');

module.exports = function(app){
	app.get('/growplans', function (req, res){
		if( !(req.user && req.user.id)){
			return res.redirect('/login');
		}

		res.render('growplans', {
			locals: {
				title : 'Grow Plans',
				className : 'growplans',
				message : req.flash('info')
			}
		});
	});

	// app.put('/growplans', function (req, res, next){
	// 	UserModel.findById(req.user, function (err, user) {
	// 		if (err) { next(err); }

	//     user.email = req.body.email;
	//     user.name = { 
	//     	'first' : req.body.firstname,
	//     	'last' : req.body.lastname
	//     };
	//     user.locale = req.body.locale;
	//     user.phone = req.body.phone;
	//     // user.address = {
	//     // 	line1 : req.body.addressline1,
	//     // 	line2 : req.body.addressline2,
	//   		// city : req.body.city,
	//   		// state : req.body.state,
	//   		// zip : req.body.zip,
	//   		// country : req.body.country
	//     // };
	//     user.notificationPreferences = {
	// 	  	email: req.body.notifications_email,
	// 	  	sms: req.body.notifications_sms
	// 	  };

	// 	  var locals = {
	// 	  	title : 'Profile - Updated',
	// 			className : 'profile',
	// 			user: user
	// 	  }

	//     user.save(function (err) {
	//       if (err) { return next(err); }
 //      	res.render('profile', locals);
	//     });
	//   });
	// });
}