var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	UserSchema = undefined,
	User = undefined,
	nodemailer = require('nodemailer'),
	crypto = require('crypto'),
	bcrypt = require('bcrypt'),
	winston = require('winston'),
	verificationEmailDomain = 'bitponics.com';

mongooseTypes.loadTypes(mongoose); // loads types Email and Url (https://github.com/bnoguchi/mongoose-types)

UserSchema = new Schema({
  name : {
	    first: String
	  , last: String
	},
  email : { 
  	type : mongoose.SchemaTypes.Email, 
  	required : true, 
  	unique: true 
  },
  phone : { type : String },
  address : {
  	line1 : String,
  	line2 : String,
  	city : String,
  	state : String,
  	zip : String,
  	country : { type: String, default: 'United States'}
  },
  salt: { type: String, required: true },
  hash: { type: String, required: true },
  locale: String,
  active : { type : Boolean, default : false },
  admin :  { type : Boolean, default : false },
  activationToken : { type : String, default : '' },
  sentEmail : { type: Boolean, default: false },
  notificationPreferences: {
  	email: { type: Boolean, default: true },
  	sms: { type: Boolean, default: false }
  },
  apiPublicKey : String,
  apiPrivateKey : String
},
{ strict: true });

UserSchema.virtual('name.full')
	.get(function () {
		return this.name.first + ' ' + this.name.last;
	})
	.set(function (setFullNameTo) {
	  	var split = setFullNameTo.split(' ')
	  		, firstName = split[0]
	    	, lastName = split[1];

		this.set('name.first', firstName);
		this.set('name.last', lastName);
	});


UserSchema.static('createUserWithPassword', function(userProperties, password, next){
	var newUser = new User(userProperties);

	bcrypt.genSalt(10, function(err, salt) {
    	if (err) { return next(err); }
    	newUser.salt = salt;
    	
    	bcrypt.hash(password, salt, function(err, hash) {
    		if (err) { return next(err); }

      		newUser.hash = hash;

      		newUser.save(function(err) {
		      if (err) { return next(err); }
		      next(null, newUser);
		    });
		});
	});
});

UserSchema.method('verifyPassword', function(password, next) {
  bcrypt.compare(password, this.hash, next);
});


UserSchema.static('authenticate', function(email, password, next) {
  this.findOne({ email: email }, function(err, user) {
      if (err) { return next(err); }
      if (!user) { return next(null, false); }
      user.verifyPassword(password, function(err, passwordCorrect) {
        if (err) { return next(err); }
        if (!passwordCorrect) { return next(null, false); }
        return next(null, user);
      });
    });
});


/**
 * Used by Passport HMAC strategy
 */
UserSchema.static('getByPublicKey', function(apiPublicKey, next) {
  User.findOne({ apiPublicKey: apiPublicKey }, function(err, user) {
      if (err) { return next(err); }
      if (!user) { return next(null, false); }

      return next(null, user, user.apiPrivateKey);
  });
});

UserSchema.plugin(useTimestamps); // adds createdAt/updatedAt fields to the schema, and adds the necessary middleware to populate those fields 

/**
 *  Give user API keys if needed 
 */
UserSchema.pre('save', function(next){
	var user = this;
	
	if (user.apiPublicKey && user.apiPrivateKey){ return next(); }

	crypto.randomBytes(48, function(ex, buf) {
		if (ex) { return next(ex); }
	  	var keysSource = buf.toString('hex'),
	  		publicKey = keysSource.substr(0, 16),
	  		privateKey = keysSource.substr(16, 32);
	  	
	  	user.apiPublicKey = publicKey;
	  	user.apiPrivateKey = privateKey;

	  	next();
  	});
});

/**
 *  Give user activation token if needed
 */
UserSchema.pre('save', function(next){
	var user = this,
		token = "",
		verifyUrl = "";

	winston.info('user.active:'+user.active)
	winston.info('user.sentEmail:'+user.sentEmail)

	if(user.activationToken && user.active) { return next(); }
	
	//create random string to verify against
	crypto.randomBytes(48, function(ex, buf) {
		if (ex) { return next(ex); }
		
		token = buf.toString('hex');
		user.activationToken = token;
		verifyUrl = 'http://' + verificationEmailDomain + '/register?verify=' + user.activationToken;

	  	//send activation email if not activated user
		if(user.active && user.sentEmail){ return next(); }
			
		// create reusable transport method (opens pool of SMTP connections)
		var smtpTransport = nodemailer.createTransport("SMTP",{
		    service: "Gmail",
		    auth: {
		        user: "jack@bitponics.com",
		        pass: "voonhyvenvlyfonq" //app specific password on jack's account
		    }
		});

		// setup e-mail data with unicode symbols
		var mailOptions = {
		    from: "Bitponics ✔ <jack@bitponics.com>", // sender address
		    to: user.email, // can be list of receivers
		    subject: "Hello ✔", // Subject line
		    text: "Hello world ✔", // plaintext body
		    html: '<b>Hello world ✔</b><p><a href="' + verifyUrl + '">Verify</a></p>' // html body
		}

		// send mail with defined transport object
		smtpTransport.sendMail(mailOptions, function(err, response){
		    if(err){ return next(err); }
		    winston.info("Message sent: " + response.message);
	        // if you don't want to use this transport object anymore, uncomment following line
		    smtpTransport.close(); // shut down the connection pool, no more messages

	        user.sentEmail = true;
		    user.save(function(err){
		    	if (err) { return next(err); }
		    	return next();
		    });
		});
	});
});


User = mongoose.model('User', UserSchema);

module.exports.setVerificationEmailDomain = function(domain){
	verificationEmailDomain = domain;
};

module.exports.schema = UserSchema;
module.exports.model = User;


/*
	// Auth
	UserSchema.plugin(mongooseAuth, {
		everymodule: {
	          everyauth: {
	              User: function () {
	                return User;
	            }
	        }
	    },
	    facebook: {
	      	everyauth: {
	      		myHostname: app.config.appUrl,
	          	appId: app.config.auth.fb.appId,
	        	appSecret: app.config.auth.fb.appSecret,
	        	redirectPath: '/',
	        	scope: 'email'
	      	}
	    },
	    google: {
			everyauth: {
				myHostname: app.config.appUrl,
				appId: app.config.auth.google.clientId,
				appSecret: app.config.auth.google.clientSecret,
				redirectPath: '/',
				scope: 'https://www.googleapis.com/auth/userinfo.email',

			}
		},
		password: {
	        loginWith: 'email', 

			everyauth: {
	            getLoginPath: '/login',
	          	postLoginPath: '/login',
	          	loginView: 'login.jade',
	          	loginLocals : {
	          		title : 'Login - Bitponics'
	          	},
	          	getRegisterPath: '/signup',
	          	postRegisterPath: '/signup',
	          	registerView: 'signup.jade',
	          	registerLocals: {
			      title: 'Sign Up - Bitponics'
				},
	          	loginSuccessRedirect: '/',
	         	registerSuccessRedirect: '/register'
	        }
	    }
	});


	// now that we've initialized the mongoose-auth plugin, override any functions

	// override createWithFB
	UserSchema.static('createWithFB', function (fbUserMeta, accessToken, expires, callback) {
	    console.log('in da fb override wuttup');
	    //console.log(fbUserMeta, accessToken, expires, callback);
	    var expiresDate = new Date;
	    expiresDate.setSeconds(expiresDate.getSeconds() + expires);

	    var params =  {
	      fb: {
	          id: fbUserMeta.id
	        , accessToken: accessToken
	        , expires: expiresDate
	        , name: {
	              full: fbUserMeta.name
	            , first: fbUserMeta.first_name
	            , last: fbUserMeta.last_name
	          }
	        , alias: fbUserMeta.link.match(/^http:\/\/www.facebook\.com\/(.+)/)[1]
	        , gender: fbUserMeta.gender
	        , email: fbUserMeta.email
	        , timezone: fbUserMeta.timezone
	        , locale: fbUserMeta.locale
	        , verified: fbUserMeta.verified
	        , updatedTime: fbUserMeta.updated_time
	      }
	    };

	    // password.loginKey() is email
	    params[everyauth.password.loginKey()] = fbUserMeta.email; 
	    params.email = fbUserMeta.email;
	    this.create(params, callback);
	  });

	// override createWithGoogleOAuth
	UserSchema.static('createWithGoogleOAuth', function (googleUser, accessToken, accessTokenExtra, callback) {
	    console.log('in da google override wuttup');
	    var expiresDate = new Date;
	    expiresDate.setSeconds(expiresDate.getSeconds() +  accessTokenExtra.expires_in);

	    var params = {
	      google: {
	          email: googleUser.id
	        , expires: expiresDate
	        , accessToken: accessToken
	        , refreshToken: accessTokenExtra.refresh_token
	      }
	    };

	    // TODO Only do this if password module is enabled
	    //      Currently, this is not a valid way to check for enabled
	    if (everyauth.password)
	      params[everyauth.password.loginKey()] = "google:" + googleUser.id; // Hack because of way mongodb treate unique indexes
	  	params.email = googleUser.email;
	    this.create(params, callback);
	  });
*/

	
