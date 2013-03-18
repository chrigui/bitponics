var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	mongoosePlugins = require('../lib/mongoose-plugins'),
  useTimestamps = mongoosePlugins.useTimestamps,
	ObjectIdSchema = Schema.ObjectId,
  ObjectId = mongoose.Types.ObjectId,
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils');

var LightFixtureSchema = new Schema({
	brand : { type : String },
	name : { type : String, required: true},
	type : { type : String },
	watts : { type : Number },
	/**
	 * Number of bulbs the fixture holds
	 */
	bulbCapacity : { type : Number, default:  1 },
  createdBy : { type : ObjectIdSchema, ref: 'User' },
  visibility : { 
    type: String, 
    enum: [
      feBeUtils.VISIBILITY_OPTIONS.PUBLIC, 
      feBeUtils.VISIBILITY_OPTIONS.PRIVATE
    ], 
    default: feBeUtils.VISIBILITY_OPTIONS.PUBLIC
  }
},
{ id : false });

LightFixtureSchema.plugin(useTimestamps);



/*********************** STATIC METHODS **************************/


/**
 * Compares all user-defined properties, returns boolean
 * 
 * @param {LightFixture} source
 * @param {LightFixture} other
 * @return {boolean} True if source and other are equivalent, false if not
 */
LightFixtureSchema.static('isEquivalentTo', function(source, other){
  if (source.type !== other.type){
    return false;
  }
  if (source.watts !== other.watts){
    return false;
  }
  if (source.brand !== other.brand){
    return false;
  }
  if (source.name !== other.name){
    return false;
  }
  if (source.bulbCapacity !== other.bulbCapacity){
    return false;
  }
  return true;
});


/**
 * Takes a LightFixture object, sees if it exists in the database as defined.
 * If not, creates a new LightFixture and returns it
 * 
 * @param {object} options.lightFixture
 * @param {User} options.user : used to set "createdBy" field for new objects
 * @param {VISIBILITY_OPTION} options.visibility : used to set "visibility" field for new objects. value from fe-be-utils.VISIBILITY_OPTIONS
 * @param {function(err, Action)} callback
 */
LightFixtureSchema.static('createNewIfUserDefinedPropertiesModified', function(options, callback){
  var submittedLightFixture = options.lightFixture,
      user = options.user,
      visibility = options.visibility,
      LightFixtureModel = this;

    LightFixtureModel.findById(submittedLightFixture._id, function(err, lightFixtureResult){
      if (err) { return callback(err); }

      if (lightFixtureResult && LightFixtureModel.isEquivalentTo(submittedLightFixture, lightFixtureResult)){
        return callback(null, lightFixtureResult);
      }
      
      // If we've gotten here, either there was no lightFixtureResult
      // or the item wasn't equivalent
      submittedLightFixture._id = new ObjectId();
      submittedLightFixture.createdBy = user;
      submittedLightFixture.visibility = visibility;

      LightFixtureModel.create(submittedLightFixture, function(err, createdLightFixture){
        return callback(err, createdLightFixture);
      });  
    });
  } 
);

/*********************** END STATIC METHODS **************************/


exports.schema = LightFixtureSchema;
exports.model = mongoose.model('LightFixture', LightFixtureSchema);
