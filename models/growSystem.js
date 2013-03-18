var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	ObjectIdSchema = Schema.ObjectId,
  ObjectId = mongoose.Types.ObjectId,
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils');

var GrowSystemSchema = new Schema({
	
	name: { type: String, required: true },
	 
	description: { type: String, required: false },

	createdBy: { type: ObjectIdSchema, ref: 'User'},
	
	type: { type: String, required: true },
	
	/**
	 * reservoirSize is number of gallons
	 */
	reservoirSize: { type: Number },
	
	plantCapacity: { type: Number, required: true },

	overallSize: {
		w: { type: Number },
		h: { type: Number },
		d: { type: Number }
	},

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

GrowSystemSchema.plugin(useTimestamps);


GrowSystemSchema.virtual('reservoirSizeWithUnits')
	/**
	 * Setter takes an object of the form { value: Number, unit: String}
	 * unit must be 'liters' or 'gallons'
	 */
	.set(function(reservoirSizeWithUnits){
		var unit = reservoirSizeWithUnits.unit || 'gallons',
			value = reservoirSizeWithUnits.value;

		if (unit === 'liters'){
			// 1 liter = 0.264172052 gallons
			this.set('reservoirSize', value * 0.264172052);
		} else {
			this.set('reservoirSize', value);
		}
	});



/*********************** STATIC METHODS ******************************/


GrowSystemSchema.static('isEquivalentTo', function(source, other){
  if (source.name !== other.name){
    return false;
  }
  if (source.description !== other.description){
    return false;
  }
  if (source.type !== other.type){
    return false;
  }
  if (source.reservoirSize !== other.reservoirSize){
    return false;
  }
  if (source.plantCapacity !== other.plantCapacity){
    return false;
  }
  // existence of overallSize property
  if ( !(
      (source.overallSize && other.overallSize)
      ||
      (!source.overallSize && !other.overallSize)
      )
    )
  { 
    return false; 
  }
  // deep check of overallSize
  if (source.overallSize && other.overallSize){
    if (source.overallSize.w !== other.overallSize.w){
      return false;
    }
    if (source.overallSize.h !== other.overallSize.h){
      return false;
    }
    if (source.overallSize.d !== other.overallSize.d){
      return false;
    }
  }
  return true;
});


/**
 * Takes a fully-populated GrowSystem object, sees if it exists in the database as defined.
 * If not, creates a new GrowSystem and returns it
 * 
 * @param {object} options.growSystem
 * @param {User} options.user : used to set "createdBy" field for new objects
 * @param {VISIBILITY_OPTION} options.visibility : used to set "visibility" field for new objects. value from fe-be-utils.VISIBILITY_OPTIONS
 * @param {function(err, Action)} callback
 */
GrowSystemSchema.static('createNewIfUserDefinedPropertiesModified', function(options, callback){
  var submittedGrowSystem = options.growSystem,
      user = options.user,
      visibility = options.visibility,
      GrowSystemModel = this;

    GrowSystemModel.findById(submittedGrowSystem._id, function(err, growSystemResult){
      if (err) { return callback(err); }

      if (growSystemResult && GrowSystemModel.isEquivalentTo(submittedGrowSystem, growSystemResult)){
        return callback(null, growSystemResult);
      }
      
      // If we've gotten here, either there was no growSystemResult
      // or the item wasn't equivalent
      submittedGrowSystem._id = new ObjectId();
      submittedGrowSystem.createdBy = user;
      submittedGrowSystem.visibility = visibility;

      GrowSystemModel.create(submittedGrowSystem, function(err, createdGrowSystem){
        return callback(err, createdGrowSystem);
      });  
    });
  } 
);

/*********************** END STATIC METHODS ******************************/

exports.schema = GrowSystemSchema;
exports.model = mongoose.model('GrowSystem', GrowSystemSchema);
