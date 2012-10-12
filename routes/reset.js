var User = require('../models/user').model,
	nodemailer = require('nodemailer'),
	bcrypt = require('bcrypt'),
	crypto = require('crypto'),
	winston = require('winston'),
	timezone = require('timezone/loaded'),	
	verificationEmailDomain = 'bitponics.com'
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

module.exports = function(app){
	app.get('/reset', function (req, res){
		var user = req.user,
				verify = req.query.verify,
				locals = { 
					title : 'Reset your password',
					verify : verify,
					pageState : undefined
				};

		if( !(user && user.id)){
			return verify ?
				res.redirect('/login?redirect=/reset?verify=' + verify) :
				res.redirect('/login?redirect=/reset');
		}


		//if verify, check against user's resetToken
		if (verify) {
			User.findOne({ resetToken: verify }, 
		    	function (err, user) {
			    	if (err) { return next(err); }
						
						if (user) {
							locals.pageState = "fromEmailLink"
							res.render('reset', locals);
						} else {
							//if resetToken not found, then have user submit for new one
							locals.message = "Sorry, we can't find your password reset request. Please submit another and check your email."
							res.render('reset', locals);
						}
		    	}
	    	);
		} else {
			res.render('reset', locals);
		}

	});

	app.post('/reset', function (req, res, next){
		var email = req.body.email,
				locals = { 
					title : 'Reset your password',
					pageState : "emailSent"
				},
				oldpw = req.body['password'],
				newpw = req.body['confirm_password'],
				newpw2 = req.body['new_password'];
				
		if ( !(req.user && req.user.id)) {
			return res.redirect('/login?redirect=/reset');
		}

		User.findById(req.user.id, 
    	function (err, user) {
    		console.log(err);
    		console.log('current user form mongo:');
	    	console.log(user);

				if (email) {

					crypto.randomBytes(48, function(ex, buf) {
						if (ex) { return done(ex); }
						
						token = buf.toString('hex');
						user.resetToken = token;
						verifyUrl = 'http://' + verificationEmailDomain + '/reset?verify=' + user.resetToken;

						var smtpTransport = nodemailer.createTransport("SMTP",{
						    service: "Gmail",
						    auth: {
						        user: "accounts@bitponics.com",
						        pass: "8bitpass"
						    }
						});

						var mailOptions = {
						    from: "Bitponics <accounts@bitponics.com>",
						    to: email,
						    subject: "Your password reset request",
						    text: "Please follow this link to reset your password: <"+verifyUrl+">",
						    html: '<b>Please follow this link to reset your password:</b><p><a href="' + verifyUrl + '">Reset</a></p>'
						}
						
						smtpTransport.sendMail(mailOptions, function(err, response){
						    if(err){ return next(err); }
						    winston.info("Message sent: " + response.message);
					  
						    smtpTransport.close();

						    user.save(function(err){
						    	if (err) { return next(err); }
						    	res.render('reset', locals)
						    });
						});
					});

				} else if (oldpw || newpw || newpw2) {

					if (oldpw.length && (newpw == newpw2)) { //valid
						updatePassword(user, oldpw, newpw, function(err){
							if(!err){
								locals.pageState = "passwordReset";
								res.render('reset', locals)	
							}
						});
					} else { //invalid, send back to last state
						locals.pageState = "fromEmailLink";
						locals.formError = { "password": true };
						res.render('reset', locals)
					}

				} else {
					
					res.render('reset', locals)

				}
			}
  	);
	});
}

var updatePassword = function(user, oldpw, newpw, callback) {

	
	//confirm existing password first
	bcrypt.hash(oldpw, user.salt, function(err, hash) {
		if (err) { return next(err); }
		console.log(hash === user.hash);
		
		//if the password hash matches, then set new password hash/salt on user model
		if(hash === user.hash) {

			bcrypt.genSalt(10, function(err, salt) {
		  	if (err) { return next(err); }
		  	user.salt = salt;
		  	
		  	bcrypt.hash(newpw, salt, function(err, hash) {
		  		if (err) { return next(err); }

		    		user.hash = hash;

		    		user.save( function(err) {
							callback(err);
						});
				});
			});
			
		} else {
			callback("Invalid current password.");
		}
		

	});

}