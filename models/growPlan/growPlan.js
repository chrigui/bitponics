var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	mongoosePlugins = require('../../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	Schema = mongoose.Schema,
	ObjectIdSchema = Schema.ObjectId,
  ObjectId = mongoose.Types.ObjectId,
	PhaseSchema = require('./phase').schema,
	Phase = require('./phase').model,
	async = require('async'),
  ModelUtils = require('../utils'),
	getObjectId = ModelUtils.getObjectId,
  requirejs = require('../../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils'),
  PlantModel = require('../plant').model,
  i18nKeys = require('../../i18n/keys'),
  mongooseConnection = require('../../config/mongoose-connection').defaultConnection;
  

var GrowPlanModel,
	
GrowPlanSchema = new Schema({
	
  /**
   * The GrowPlan from which this GrowPlan was branched and customized
   */
  parentGrowPlanId: { type: ObjectIdSchema, ref: 'GrowPlan' },
	

  /**
   * User that created this GP
   */
  createdBy: { type: ObjectIdSchema, ref: 'User' },
	
  /**
   * Name
   */
  name: { type: String, required: true },
	

  description: { type: String, required: true },
	

  plants: [{ type: ObjectIdSchema, ref: 'Plant' }],
	

  phases: [PhaseSchema],
	
  
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

GrowPlanSchema.plugin(useTimestamps);


/************************** VIRTUALS ***************************/


/***********
 * the 'sensors' and 'controls' virtuals can really only operate with fully-populated GrowPlans
 * Maybe they should be refactored to be "getSensors", "getControls" static utility methods instead (like isEquivalentTo)
 */

/**
 * Sensors is a read-only view of all the sensors used by the GrowPlan.
 * Checks phases.idealRanges.sCode

GrowPlanSchema.virtual('sensors')
    .get(function () {
        var sensors = [];
        this.phases.each(function(phase){
            phase.idealRanges.each(function(idealRange){
                if (sensors.indexOf(idealRange.sCode) < 0){
                    sensors.push();
                }
            });
        });

        return sensors.sort();
    });

/**
 * Controls is a read-only view of all the controls used by the GrowPlan.
 * Checks phases.actions.control.
 * TODO : check phases.idealRanges.actionBelowMin, phases.idealRanges.actionAboveMax
 * Follows the assumption that phaseEndActions will not have controls

GrowPlanSchema.virtual('controls')
    .get(function () {
        var controls = [];
        this.phases.each(function(phase){
            phase.actions.each(function(action){
                // TODO : decide how to handle idealRange actions...need to actually pull the action from the db
                if (!action.control){ return; }
                var controlId = getObjectId(action.control);
                // TODO : this indexOf check probably won't be adequate if controlid is actually an object
                // Maybe store the toString() values instead so we can use a reliable string comparison?
                if (controls.indexOf(controlId) < 0){
                    controls.push(controlId);
                }
            });
            phase.idealRanges.each(function(idealRange){
                // TODO : decide how to handle idealRange actions...need to actually pull the action from the db
                // if it isn't yet populated. Might get expensive.
                if (idealRange.actionBelowMin){ }
                if (idealRange.actionAboveMax){ }
            });
        });

        return controls;
    });
 */

/************************** END VIRTUALS ***************************/

/************************** MIDDLEWARE  ***************************/

/**
 *  Validate 
 *
 */
GrowPlanSchema.pre('save', function(next){
	var phases = this.phases;
	// Ensure unique names across phases
	for (var i = 0, length = phases.length; i < length; i++){
		var phaseName = phases[i].name;

    if (!phaseName){
      phases[i].name = feBeUtils.getOrdinal(i);
    }

		for (var j = i+1; j < length; j++){
			if (phaseName === phases[j].name){
				return next(new Error("Duplicate phase name \"" + phaseName + "\". Phases in a grow plan must have unique names."));
			}
		}
	}
	return next();
});

/************************** END MIDDLEWARE ***************************/



/************************** INSTANCE METHODS  ***************************/

/**
 * Given a number of days into the GrowPlan, find
 * the target phase & number of days into the phase.
 * If numberOfDays exceeds total span of GrowPlan,
 * returns last day of last phase
 * 
 * @param numberOfDays {Number}
 *
 * @return { phaseId : phaseId, day : numberOfDaysIntoPhase } 
 *
 */
GrowPlanSchema.method('getPhaseAndDayFromStartDay', function(numberOfDays){
	var phases = this.phases,
		i = 0,
		length = phases.length,
		remainder = numberOfDays,
		phaseDays;

	for (; i < length; i++){
		phaseDays = phases[i].expectedNumberOfDays;
		if (remainder < phaseDays){
			return {
				phaseId : phases[i]._id,
				day : remainder
			};
		} else {
			remainder -= phaseDays;
		}
	}

	return {
		phaseId : phases[length - 1]._id,
		day : phases[length - 1].expectedNumberOfDays
	};
});


/************************** END INSTANCE METHODS  ***************************/


/************************** STATIC METHODS  ***************************/

/**
 * Given 2 GrowPlan objects, determine whether they're "equivalent" by comparing 
 * all user-defined properties (ignoring _id's, createdAt/updatedAt)
 * 
 * @param source {GrowPlan}. Fully populated, POJO GrowPlan model object. Retrieved using ModelUtils.getFullyPopulatedGrowPlan
 * @param other {GrowPlan}. Fully populated, POJO GrowPlan model object.
 * @param callback {function(err, bool)} : to be called with result. result is a boolean,
 * 					true if the objects are equivalent, false if not
 *
 */
GrowPlanSchema.static('isEquivalentTo', function(source, other, callback){
	// compare name
	if (source.name !== other.name) { return callback(null, false); }


	// compare description
	if (source.description !== other.description) { return callback(null, false); }


	// compare plants

	if (source.plants.length !== other.plants.length) { return callback(null, false); }
	// TODO : this loop can probably be optimized
	var allPlantsFound = true;
	for (var i = 0, length = source.plants.length; i < length; i++){
		var plantId = getObjectId(source.plants[i]),
			plantFound = false;
		for (var j = 0; j < length; j++){
			if (plantId.equals(getObjectId(other.plants[j]))) {
				plantFound = true;
				break;
			}
		}
		if (!plantFound) { 
			allPlantsFound = false;
			break;
		}
	}
	if (!allPlantsFound){
		return callback(null, false);
	}
	
	
	// compare phases, shallow
	if (source.phases.length !== other.phases.length) { return callback(null, false); }
	
	// Now that we've passed all of the shallow comparisons, 
	// we need to do all of the async comparisons
	async.parallel(
		[
			function phasesComparison(innerCallback){
				var allPhasesAreEquivalent = true;
				async.forEach(source.phases, 
					function phaseIterator(phase, phaseCallback){
						var otherPhase = other.phases[source.phases.indexOf(phase)];
						return PhaseSchema.statics.isEquivalentTo(phase, otherPhase, function(err, isEquivalent){
							if (!isEquivalent){
								allPhasesAreEquivalent = false;
								// TODO : short-circuit the async loop by calling callback with an error? or is that too dirty
							}
							return phaseCallback();
						});
					},
					function phaseLoopEnd(err){
						return innerCallback(err, allPhasesAreEquivalent);
					}
				);
			}
		],
		function parallelComparisonEnd(err, results){
			var allAsyncEquivalenceChecksPassed = results.every(function(result){ return result; });
			return callback(err, allAsyncEquivalenceChecksPassed)
		}
	);
});


/**
 * Takes a fully-populated GrowPlan object (such as is submitted from grow-plans creation page)
 * and, for all nested documents (plants, phases.actions, phases.nutrients, etc) creates them if they don't match existing DB entries
 * Then saves the whole shebang and returns it
 * 
 * @param {object} options.growPlan : fully-populated grow plan POJO
 * @param {User} options.user : used to set "createdBy" field for new objects
 * @param {VISIBILITY_OPTION} options.visibility : used to set "visibility" field for new objects. value from fe-be-utils.VISIBILITY_OPTIONS
 * @param {bool} options.silentValidationFail : if true: if components fail validation, simply omit them from the created object instead of returning errors up the chain.
 * @param {function(err, GrowPlan)} callback : Returns the GrowPlanModel object (the document from the database, not a POJO)
 */
GrowPlanSchema.static('createNewIfUserDefinedPropertiesModified', function(options, callback){
  var submittedGrowPlan = options.growPlan,
      user = options.user,
      visibility = options.visibility,
      silentValidationFail = options.silentValidationFail,
      GrowPlanModel = this;


  ModelUtils.getFullyPopulatedGrowPlan( { _id: submittedGrowPlan._id }, function(err, growPlanResults){
    if (err) { return callback(err); }

    var growPlanResult = growPlanResults[0];

    if (!growPlanResult){ 
      return callback(new Error(i18nKeys.get('Invalid Grow Plan id', submittedGrowPlan._id)));
    }

    GrowPlanModel.isEquivalentTo(submittedGrowPlan, growPlanResult, function(err, isEquivalent){
      if (err) { return callback(err); }

      if (isEquivalent) { 
        return callback(null, growPlanResult); 
      } 
      
      // if not equivalent, branch the  source GrowPlan
      submittedGrowPlan._id = new ObjectId();
      submittedGrowPlan.parentGrowPlanId = growPlanResult._id;
      submittedGrowPlan.createdBy = user;
      submittedGrowPlan.visibility = visibility;

      async.parallel(
        [
          function plantsCheck(innerCallback){
            var validatedPlants = [];

            async.forEach(submittedGrowPlan.plants, 
              function validatePlant(plant, plantCallback){
                PlantModel.createNewIfUserDefinedPropertiesModified({
                  plant : plant,
                  user : user,
                  visibility : visibility,
                  silentValidationFail : silentValidationFail
                },
                function(err, validatedPlant){
                  if (validatedPlant){
                    validatedPlants.push(validatedPlant);    
                  }
                  if (silentValidationFail){
                    return plantCallback();  
                  }
                  return plantCallback(err);
                });
              },
              function plantLoopEnd(err){
                submittedGrowPlan.plants = validatedPlants;
                return innerCallback(err);
              }
            );
          },
          function phasesCheck(innerCallback){
            var validatedPhases = [];

            async.forEach(submittedGrowPlan.phases, 
              function (phase, phaseCallback){
                PhaseSchema.statics.createNewIfUserDefinedPropertiesModified(
                  {
                    phase : phase,
                    user : user,
                    visibility : visibility,
                    silentValidationFail : silentValidationFail
                  },
                  function(err, validatedPhase){
                    if (validatedPhase){
                      validatedPhases.push(validatedPhase);
                    }
                    return phaseCallback(err);  
                  }
                );            
              },
              function phaseLoopEnd(err){
                return innerCallback(err);
              }
            );
          }
        ],
        function(err, results){
          // at this point, everything should have valid, saved referenced documents
          var newGrowPlan = GrowPlanModel.create(submittedGrowPlan, callback);
        }
      );
    });
  });
}); // /.createNewIfUserDefinedPropertiesModified


/************************** END STATIC METHODS  ***************************/

GrowPlanModel = mongooseConnection.model('GrowPlan', GrowPlanSchema);
exports.schema = GrowPlanSchema;
exports.model = GrowPlanModel;
