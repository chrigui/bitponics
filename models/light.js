var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	mongoosePlugins = require('../lib/mongoose-plugins'),
  useTimestamps = mongoosePlugins.useTimestamps,
	ObjectIdSchema = Schema.ObjectId,
  ObjectId = mongoose.Types.ObjectId,
  LightBulbModel = require('./lightBulb').model,
  LightFixtureModel = require('./lightFixture').model,
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils'),
  async = require('async');

var LightSchema = new Schema({
	fixture: { type: ObjectIdSchema, ref: 'LightFixture'},
  fixtureQuantity: { type : Number, default: 1 },
  bulb: { type : ObjectIdSchema, ref: 'LightBulb'},
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

LightSchema.plugin(useTimestamps);


/*********************** STATIC METHODS **************************/

/**
 * Compares all user-defined properties, returns boolean
 * Assumes it gets fully-populated Light documents (fixture and bulb objects)
 * 
 * @param {Light} source
 * @param {Light} other
 * @return {boolean} True if source and other are equivalent, false if not
 */
LightSchema.static('isEquivalentTo', function(source, other){
  if (source.fixtureQuantity !== other.fixtureQuantity){
    return false;
  }
  
  if ( !(
      (source.fixture && other.fixture) ||
      (!source.fixture && !other.fixture)
     )
    ){ 
    return false;
  }
  if (source.fixture){
    if (!LightFixtureModel.isEquivalentTo(source.fixture, other.fixture)){
      return false;
    }
  }

  if ( !(
      (source.bulb && other.bulb) ||
      (!source.bulb && !other.bulb)
     )
    ){ 
    return false;
  }
  if (source.bulb){
    if (!LightBulbModel.isEquivalentTo(source.bulb, other.bulb)){
      return false;
    }
  }

  return true;
});


/**
 * Assumes it gets a fully-populated Light object
 * Compares the referenced documents, creates them if they're new
 * Then returns the validated light
 *
 * @param {object} options.light
 * @param {User} options.user : used to set "createdBy" field for new objects
 * @param {VISIBILITY_OPTION} options.visibility : used to set "visibility" field for new objects. value from fe-be-utils.VISIBILITY_OPTIONS
 * @param {function(err, GrowPlan)} callback
 */
LightSchema.static('createNewIfUserDefinedPropertiesModified', function(options, callback){
  var submittedLight = options.light,
      user = options.user,
      visibility = options.visibility,
      LightModel = this;

  LightModel.findById(submittedLight._id)
  .populate('fixture')
  .populate('bulb')
  .exec(function(err, lightResult){
    if (lightResult && LightModel.isEquivalentTo(submittedLight, lightResult)){
      return callback(null, lightResult);
    }
    // If we've gotten here, either there was no lightResult
    // or the item wasn't equivalent
    submittedLight._id = new ObjectId();
    submittedLight.createdBy = user;
    submittedLight.visibility = visibility;
  
    async.parallel(
      [
        function validateFixture(innerCallback){
          if (!submittedLight.fixture) { return innerCallback(); }

          LightFixtureModel.createNewIfUserDefinedPropertiesModified(
            {
              lightFixture : submittedLight.fixture,
              user : user,
              visibility : visibility
            },
            function(err, validatedFixture){
              if (err) { return innerCallback(err); }
              submittedLight.fixture = validatedFixture;
              return innerCallback();
            }
          );
        },
        function validateBulb(innerCallback){
          if (!submittedLight.bulb) { return innerCallback(); }

          LightBulbModel.createNewIfUserDefinedPropertiesModified(
            {
              lightBulb : submittedLight.bulb,
              user : user,
              visibility : visibility
            },
            function(err, validatedBulb){
              if (err) { return innerCallback(err); }
              submittedLight.bulb = validatedBulb;
              return innerCallback();
            }
          );
        }
      ],
      function parallelEnd(err, results){
        LightModel.create(submittedLight, function(err, createdLight){
          return callback(null, createdLight);
        });  
      }
    );
  });
});

/*********************** END STATIC METHODS **************************/

exports.schema = LightSchema;
exports.model = mongoose.model('Light', LightSchema);
