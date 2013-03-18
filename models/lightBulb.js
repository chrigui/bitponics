var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	ObjectIdSchema = Schema.ObjectId,
  ObjectId = mongoose.Types.ObjectId,
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils');

var LightBulbSchema = new Schema({
	type: { type : String, required : true },
	watts: { type : Number },
	brand : { type : String },
	name : { type : String },
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

LightBulbSchema.plugin(useTimestamps);



/*********************** STATIC METHODS **************************/

/**
 * Compares all user-defined properties, returns boolean
 * 
 * @param {LightBulb} source
 * @param {LightBulb} other
 * @return {boolean} True if source and other are equivalent, false if not
 */
LightBulbSchema.static('isEquivalentTo', function(source, other){
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
  return true;
});

/**
 * Takes a LightBulb object, sees if it exists in the database as defined.
 * If not, creates a new LightBulb and returns it
 * 
 * @param {object} options.lightBulb
 * @param {User} options.user : used to set "createdBy" field for new objects
 * @param {VISIBILITY_OPTION} options.visibility : used to set "visibility" field for new objects. value from fe-be-utils.VISIBILITY_OPTIONS
 * @param {function(err, Action)} callback
 */
LightBulbSchema.static('createNewIfUserDefinedPropertiesModified', function(options, callback){
  var submittedLightBulb = options.lightBulb,
      user = options.user,
      visibility = options.visibility,
      LightBulbModel = this;

    LightBulbModel.findById(submittedLightBulb._id, function(err, lightBulbResult){
      if (err) { return callback(err); }

      if (lightBulbResult && LightBulbModel.isEquivalentTo(submittedLightBulb, lightBulbResult)){
        return callback(null, lightBulbResult);
      }
      
      // If we've gotten here, either there was no lightBulbResult
      // or the item wasn't equivalent
      submittedLightBulb._id = new ObjectId();
      submittedLightBulb.createdBy = user;
      submittedLightBulb.visibility = visibility;

      LightBulbModel.create(submittedLightBulb, function(err, createdLightBulb){
        return callback(err, createdLightBulb);
      });  
    });
  } 
);
/*********************** END STATIC METHODS **************************/

exports.schema = LightBulbSchema;
exports.model = mongoose.model('LightBulb', LightBulbSchema);
