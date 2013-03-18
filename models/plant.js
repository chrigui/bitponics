var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	ObjectIdSchema = Schema.ObjectId,
  ObjectId = mongoose.Types.ObjectId,
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils');

var PlantSchema = new Schema({
	name: { type: String, required: true },
  createdBy: { type: ObjectIdSchema, ref: 'User'},
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

PlantSchema.plugin(useTimestamps);


/*********************** STATIC METHODS **************************/


/**
 * Compares all user-defined properties, returns boolean
 * 
 * @param {Plant} source
 * @param {Plant} other
 * @return {boolean} True if source and other are equivalent, false if not
 */
PlantSchema.static('isEquivalentTo', function(source, other){
  return source.name === other.name;
});


/**
 * Takes a Plant object, sees if it exists in the database as defined.
 * If not, creates a new Plant and returns it
 * 
 * @param {object} options.plant
 * @param {User} options.user : used to set "createdBy" field for new objects
 * @param {VISIBILITY_OPTION} options.visibility : used to set "visibility" field for new objects. value from fe-be-utils.VISIBILITY_OPTIONS
 * @param {function(err, Plant)} callback
 */
PlantSchema.static('createNewIfUserDefinedPropertiesModified', function(options, callback){
  var submittedPlant = options.plant,
      user = options.user,
      visibility = options.visibility,
      PlantModel = this;

    PlantModel.findById(submittedPlant._id, function(err, plantResult){
      if (err) { return callback(err); }

      if (plantResult && PlantModel.isEquivalentTo(submittedPlant, plantResult)){
        return callback(null, plantResult);
      }
      
      // If we've gotten here, either there was no plantResult
      // or the item wasn't equivalent
      submittedPlant._id = new ObjectId();
      submittedPlant.createdBy = user;
      submittedPlant.visibility = visibility;

      PlantModel.create(submittedPlant, function(err, createdPlant){
        return callback(err, createdPlant);
      });  
    });
  } 
);


/*********************** END STATIC METHODS **************************/

PlantSchema.path('name').index({ unique: true });

exports.schema = PlantSchema;
exports.model = mongoose.model('Plant', PlantSchema);
