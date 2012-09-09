var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	mongoosePlugins = require('../lib/mongoose-plugins'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	UserSchema = undefined,
	User = undefined,
	nodemailer = require('nodemailer'),
	crypto = require('crypto'),
	bcrypt = require('bcrypt');

mongooseTypes.loadTypes(mongoose); // loads types Email and Url (https://github.com/bnoguchi/mongoose-types)

UserSchema = new Schema({
  email : { 
  	type : mongoose.SchemaTypes.Email, 
  	required : true, 
  	unique: true 
  },
  name : {
        first: String
      , last: String
    },
  salt: { type: String, required: true },
  hash: { type: String, required: true },
  locale: String,
  active : { type : Boolean, default : false },
  admin :  { type : Boolean, default : false },
  activationToken : { type : String, default : '' },
  sentEmail : { type: Boolean, default: false }
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

/*
UserSchema.virtual('password')
	.get(function () {
	  //return this._password;
	  return this.hash;
	})
	.set(function (password) {
	  //this._password = password;
	  var salt = this.salt = bcrypt.genSaltSync(10);
	  this.hash = bcrypt.hashSync(password, salt);
	});
*/

UserSchema.static('createUserWithPassword', function(userProperties, password, callback){
	var newUser = new User(userProperties);

	bcrypt.genSalt(10, function(err, salt) {
    	if (err) { return callback(err); }
    	newUser.salt = salt;
    	
    	bcrypt.hash(password, salt, function(err, hash) {
    		if (err) { return callback(err); }

      		newUser.hash = hash;

      		newUser.save(function(err) {
		      if (err) { return callback(err); }
		      callback(null, newUser);
		    });
		});
	});
});

UserSchema.method('verifyPassword', function(password, callback) {
  bcrypt.compare(password, this.hash, callback);
});

UserSchema.static('authenticate', function(email, password, callback) {
  this.findOne({ email: email }, function(err, user) {
      if (err) { return callback(err); }
      if (!user) { return callback(null, false); }
      user.verifyPassword(password, function(err, passwordCorrect) {
        if (err) { return callback(err); }
        if (!passwordCorrect) { return callback(null, false); }
        return callback(null, user);
      });
    });
});

UserSchema.plugin(mongoosePlugins.useTimestamps); // adds createdAt/updatedAt fields to the schema, and adds the necessary middleware to populate those fields 

UserSchema.pre('save', function(next){
	var user = this,
		token = "",
		verifyUrl = "";

	//give user activation token if needed
	if(user.activationToken === '' || user.activationToken === null) {
		//create random string to verify against
		crypto.randomBytes(48, function(ex, buf) {
		  token = buf.toString('hex');
		  user.activationToken = token;
		  verifyUrl = 'http://bitponics.com/register?verify=' + user.activationToken;
		  
		  	//send activation email if not activated user
			if(!user.active && !user.sentEmail){
				//TODO:send email with activationToken in link back to /register
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
				smtpTransport.sendMail(mailOptions, function(error, response){
				    if(error){
				        console.log(error);
				    }else{
				        console.log("Message sent: " + response.message);
				        user.sentEmail = true;
				    }

				    // if you don't want to use this transport object anymore, uncomment following line
				    smtpTransport.close(); // shut down the connection pool, no more messages
				    
				    next();
				});

			}



		});
	}

	console.log('user.active:'+user.active)
	console.log('user.sentEmail:'+user.sentEmail)
});


User = mongoose.model('User', UserSchema);

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

	
