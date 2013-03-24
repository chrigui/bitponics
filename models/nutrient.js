var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	ObjectIdSchema = Schema.ObjectId,
  ObjectId = mongoose.Types.ObjectId;

var NutrientSchema = new Schema({
	brand: { type: String, required: true },
	name: { type: String, required: true },
  createdBy: { type: ObjectIdSchema, ref: 'User'}
},
{ id : false });

NutrientSchema.plugin(useTimestamps);


/*********************** STATIC METHODS **************************/


/**
 * Compares all user-defined properties, returns boolean
 * 
 * @param {Nutrient} source
 * @param {Nutrient} other
 * @return {boolean} True if source and other are equivalent, false if not
 */
NutrientSchema.static('isEquivalentTo', function(source, other){
  if (source.brand !== other.brand){
    return false;
  }
  if (source.name !== other.name){
    return false;
  }
  return true;
});


/**
 * Takes a Nutrient object, sees if it exists in the database as defined.
 * If not, creates a new Nutrient and returns it
 * 
 * @param {object} options.nutrient
 * @param {User} options.user : used to set "createdBy" field for new objects
 * @param {VISIBILITY_OPTION} options.visibility : used to set "visibility" field for new objects. value from fe-be-utils.VISIBILITY_OPTIONS
 * @param {function(err, Action)} callback
 */
NutrientSchema.static('createNewIfUserDefinedPropertiesModified', function(options, callback){
  var submittedNutrient = options.nutrient,
      user = options.user,
      visibility = options.visibility,
      NutrientModel = this;

    NutrientModel.findById(submittedNutrient._id, function(err, nutrientResult){
      if (err) { return callback(err); }

      if (nutrientResult && NutrientModel.isEquivalentTo(submittedNutrient, nutrientResult)){
        return callback(null, nutrientResult);
      }
      
      // If we've gotten here, either there was no nutrientResult
      // or the item wasn't equivalent
      submittedNutrient._id = new ObjectId();
      submittedNutrient.createdBy = user;
      submittedNutrient.visibility = visibility;

      NutrientModel.create(submittedNutrient, function(err, createdNutrient){
        return callback(err, createdNutrient);
      });  
    });
  } 
);
/*********************** END STATIC METHODS **************************/

exports.schema = NutrientSchema;
exports.model = mongoose.model('Nutrient', NutrientSchema);
