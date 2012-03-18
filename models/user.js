var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	useTimestamps = mongooseTypes.useTimestamps;
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	GrowingPlan = require('./growingPlan').model,
	mongooseAuth = require('mongoose-auth');

mongooseTypes.loadTypes(mongoose); // loads types Email and Url (https://github.com/bnoguchi/mongoose-types)



/**
 * GrowingPlanInstance : Schema, only intended for use as an embedded document in a User instance. 
 */
var GrowingPlanInstanceSchema = new Schema({
	// embedded docs get ids, so we don't need to add one explicitly (http://mongoosejs.com/docs/embedded-documents.html)
	growingPlan : { type : ObjectId, ref : 'GrowingPlan'},
	photos : {
		url : { type : mongoose.SchemaTypes.Url, required: true},
		createdAt : { type : Date, default: Date.now},
		tags: { type : [String]}
	}
});

GrowingPlanInstanceSchema.plugin(useTimestamps); // adds createdAt/updatedAt fields to the schema, and adds the necessary middleware to populate those fields 



var UserSchema = new Schema({
  email : { 
  	type : mongoose.SchemaTypes.Email, 
  	required : true, 
  	unique: true },
  name : {
        first: String
      , last: String
    },
  active : { type : Boolean, default : true },
  growingPlanInstances : [GrowingPlanInstanceSchema]
});

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


UserSchema.plugin(useTimestamps); // adds createdAt/updatedAt fields to the schema, and adds the necessary middleware to populate those fields 


/**
 * exported object is a function. Needs to be passed the app instance so that appropriate configs can be retrieved and used to complete initialization. 
 * @param app: node.js app instance. assumed to have a 
 */
module.exports = function(app){

	// Auth
	UserSchema.plugin(app.mongooseAuth, {
		everymodule: {
	          everyauth: {
	              User: function () {
	                return User;
	            }
	        }
	    },
	    twitter: {
			everyauth: {
				myHostname: app.config.appUrl,
			  	consumerKey: app.config.auth.twitter.consumerKey,
				consumerSecret: app.config.auth.twitter.consumerSecret,
				redirectPath: 'oob'
			}
		}
	});

	return {
		model : mongoose.model('User', UserSchema)
	}
};