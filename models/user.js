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
	timezone = require('timezone/loaded'),	
	verificationEmailDomain = 'bitponics.com',
	EmailConfig = require('../config/email-config');

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
  locale: { 
  	lang: { type: String, default : 'en' },
  	territory : { type : String, default: 'US'}
  },
  timezone: { type : String, default : 'America/New_York' }, // TODO : make this an enum to restrict the values? 
  active : { type : Boolean, default : false },
  admin :  { type : Boolean, default : false },
  activationToken : { type : String, default : '' },
  resetToken : { type : String, default : '' },
  sentEmail : { type: Boolean, default: false },
  notificationPreferences: {
  	email: { type: Boolean, default: true },
  	sms: { type: Boolean, default: false }
  },
  deviceKeys : [
	  {
	  	/**
	  	 * deviceId not required. We temporarily create & save unassociated deviceKeys
	  	 * for use during the setup process
	  	 */
	  	deviceId : { type: ObjectId, ref : 'Device'},
	  	/**
	  	 * Public device key is a 16-char random hex string
	  	 */
	  	public : String,
	  	/**
	  	 * Private device key is a 16-char random hex string
	  	 */
	  	private : String
	  }
  ],
  apiKey : {
  	/**
  	 * Public API key is a 16-char random hex string
  	 */
  	public: String,
  	/**
  	 * Private API key is a 32-char random hex string
  	 */
  	private: String
  },
  plans : [
  	{
  		type : { type: String, enum: [
			'free',
			'serious',
			'industrial'
		]},
		device : { type: ObjectId, ref : 'Device'},
		createdAt : { type : Date, default : Date.now },
		payments : [
			{
				ts : { type : Date },
				amount : { type : Number }
			}
		]
  	}
  ]
});

UserSchema.plugin(useTimestamps); // adds createdAt/updatedAt fields to the schema, and adds the necessary middleware to populate those fields 

UserSchema.virtual('name.full')
	.get(function () {
		var fullName = '';
		if (this.name.first) { fullName += this.name.first; }
		if (this.name.last) { fullName += ' ' + this.name.last; }
		return fullName;
	})
	.set(function (setFullNameTo) {
	  	var split = setFullNameTo.split(' ')
	  		, firstName = split[0]
	    	, lastName = split[1];

		this.set('name.first', firstName);
		this.set('name.last', lastName);
	});

UserSchema.virtual('locale.full')
	.get(function () {
		return this.locale.language + this.locale.territory ? '_' + this.locale.territory : '';
	})
	.set(function (fullLocale) {
	  	var split = fullLocale.split('_')
	  		, language = split[0]
	    	, territory = split[1];

		this.set('locale.language', language);
		this.set('locale.territory', territory || '');
	});

/**
 *  Get the current timezone offset from UTC time. This can't be a static
 *  value since offsets change with daylight savings and stuff. 
 */
UserSchema.virtual('timezoneOffset')
	.get(function(){
		var now = new Date(),
			timezoneOffsetString = timezone(now, this.timezone, '%z'),
			timezoneOffsetDirection = timezoneOffsetString[0],
			timezoneOffsetHours = parseInt(timezoneOffsetString.substr(1,2), 10),
			timezoneOffsetMinutes = parseInt(timezoneOffsetString.substr(3,2), 10),
			timezoneOffset = (timezoneOffsetDirection == '-' ? -1 : 1) * (timezoneOffsetHours * 60 * 60 * 1000) + (timezoneOffsetMinutes * 60 * 1000);
		return timezoneoffset;
	});

/**
 *  Get the available device key, if exists
 */
UserSchema.virtual('availableDeviceKey')
	.get(function(){
		var user = this,
			i,
			currentDeviceKey;

		if (!user.deviceKeys) { return; }
		
		for (i = user.deviceKeys.length - 1; i >= 0; i--) {
			currentDeviceKey = user.deviceKeys[i];
			if (!currentDeviceKey.deviceId){
				return currentDeviceKey;
			}
		};
	});

/************************** STATIC METHODS  ***************************/

UserSchema.static('createUserWithPassword', function(userProperties, password, done){
	var newUser = new User(userProperties);

	bcrypt.genSalt(10, function(err, salt) {
  	if (err) { return done(err); }
  	newUser.salt = salt;
  	
  	bcrypt.hash(password, salt, function(err, hash) {
  		if (err) { return done(err); }

    		newUser.hash = hash;

    		newUser.save(function(err) {
    		return done(err, newUser);
		    });
		});
	});
});


UserSchema.static('authenticate', function(email, password, done) {
  this.findOne({ email: email }, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(new Error('No user found with that email'), false); }
      user.verifyPassword(password, function(err, passwordCorrect) {
        if (err) { return done(err); }
        if (!passwordCorrect) { return done(new Error('Incorrect password'), false); }
        return done(null, user);
      });
    });
});


/**
 * Used by Passport BPN_DEVICE strategy
 */
UserSchema.static('getByPublicDeviceKey', function(key, done) {
  User.findOne({ 'deviceKeys.public': key }, function(err, user) {
	  if (err) { return done(err); }
      if (!user) { return done(new Error('No such device key'), false); }
      var matchingPrivateKey = user.deviceKeys.filter(function(deviceKey){
      	return deviceKey.public === key;
      })[0];
      return done(null, user, matchingPrivateKey);
  });
});

UserSchema.static('getByPublicApiKey', function(key, done) {
  User.findOne({ 'apiKey.public': key }, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(new Error('No such API key'), false); }

      return done(null, user, user.apiKey.private);
  });
});
/************************** END STATIC METHODS  ***************************/



/************** INSTANCE METHODS ********************/

UserSchema.method('verifyPassword', function(password, next) {
  bcrypt.compare(password, this.hash, next);
});

UserSchema.method('toPublicJSON', function() {
  return {
  	_id : this._id,
  	name : this.name,
  	email : this.email,
  	phone : this.phone,
  	address : this.country,
  	locale: this.locale,
  	timezone: this.timezone,
  	active : this.active,
  	notificationPreferences: this.notificationPreferences,
  	deviceKeys : this.deviceKeys.map(
  		function(el){ 
  			return { deviceId : el.deviceId, 'public' : el.public};
  		}
	),
  	apiKey : {
  		public: this.apiKey.public
  	}
  };
});

/**
 *  Give user device keys if needed. This can be done in parallel with other pre save hooks.
 *  http://mongoosejs.com/docs/middleware.html
 */
UserSchema.method('ensureAvailableDeviceKey', function(done){
	var user = this,
		availableDeviceKey,
		i,
		currentDeviceKey;

	user.deviceKeys = user.deviceKeys || [];

	for (i = user.deviceKeys.length - 1; i >= 0; i--) {
		currentDeviceKey = user.deviceKeys[i];
		if (!currentDeviceKey.deviceId){
			availableDeviceKey = currentDeviceKey;
			break;
		}
	};
	if (availableDeviceKey){
		return done(null, availableDeviceKey);
	} else {
		crypto.randomBytes(32, function(ex, buf) {
			if (ex) { return done(ex); }
		  	var keysSource = buf.toString('hex'),
		  		publicKey = keysSource.substr(0, 16),
		  		privateKey = keysSource.substr(16, 16);
		  	
		  	availableDeviceKey = {
		  		'public' : publicKey,
		  		'private' : privateKey
		  	};
		  	user.deviceKeys.push(availableDeviceKey);
		  	user.save(function(err){
		  		if (err) { return done(err);}
		  		return done(null, availableDeviceKey);
		  	})
		});	
	}
});

/************** END INSTANCE METHODS ********************/




/***************** MIDDLEWARE **********************/



/**
 * TODO 
 * Make sure there's a max of 1 "available" deviceKey at a time
 */
UserSchema.pre('save', true, function(next, done){
	var user = this;
	
	next();
	
	done();	
});

/**
 *  Give user API keys if needed. Can be done in parallel with other pre save hooks. 
 *  http://mongoosejs.com/docs/middleware.html
 */
UserSchema.pre('save', true, function(next, done){
	var user = this;
	
	next();
	
	if (user.apiKey && user.apiKey.public && user.apiKey.private){ return done(); }

	crypto.randomBytes(48, function(ex, buf) {
		if (ex) { return done(ex); }
	  	var keysSource = buf.toString('hex'),
	  		publicKey = keysSource.substr(0, 16),
	  		privateKey = keysSource.substr(16, 32);
	  	
	  	user.apiKey = {
	  		public : publicKey,
	  		private : privateKey
	  	};
	  	done();
  	});
});

/**
 *  Give user activation token if needed. This also can be done in parallel.
 */
UserSchema.pre('save', true, function(next, done){
	var user = this,
		token = "",
		verifyUrl = "";

	next();

	//winston.info('user.active:'+user.active)
	//winston.info('user.sentEmail:'+user.sentEmail)

	if(user.activationToken && user.active) { return done(); }
	
	//create random string to verify against
	crypto.randomBytes(48, function(ex, buf) {
		if (ex) { return done(ex); }
		
		token = buf.toString('hex');
		user.activationToken = token;
		verifyUrl = 'http://' + verificationEmailDomain + '/register?verify=' + user.activationToken;

	  	//send activation email if not activated user
		if(user.active && user.sentEmail){ return done(); }
			
		var emailTransport = nodemailer.createTransport("SES", EmailConfig.amazonSES.api);

		// setup e-mail data with unicode symbols
		var mailOptions = {
		    from: "accounts@bitponics.com", // sender address
		    to: user.email, // can be list of receivers
		    subject: "Bitponics Accounts", // Subject line
		    text: "Welcome to Bitponics!", // plaintext body
		    html: '<b>Welcome to the Bitponics Beta!</b><p><a href="' + verifyUrl + '">Verify your account.</a></p>' // html body
		}

		// send mail with defined transport object
		emailTransport.sendMail(mailOptions, function(err, response){
		    if(err){ return done(err); }
		    winston.info("Message sent: " + response.message);
		    emailTransport.close(); // this is probably not necessary when sending through amazonSES API but whatever

			user.sentEmail = true;
			console.log('user in sendMail callback: ');
			console.log(user);
		    done();
		});
	});
});
/***************** END MIDDLEWARE **********************/


/***************** INDEXES ************************************/
UserSchema.index({ 'email': 1 });
UserSchema.index({ 'deviceKeys.public': 1 });
UserSchema.index({ 'apiKey.public': 1 });
/***************** END INDEXES ********************************/

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

	
