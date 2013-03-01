var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	mongoosePlugins = require('../../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	PhaseSchema = require('./phase').schema,
	Phase = require('./phase').model,
	async = require('async'),
	getObjectId = require('../utils').getObjectId;


var GrowPlanModel,
	GrowPlanSchema = new Schema({
	parentGrowPlanId: { type: ObjectId, ref: 'GrowPlan' },
	createdBy: { type: ObjectId, ref: 'User' },
	name: { type: String, required: true },
	description: { type: String, required: true },
	plants: [{ type: ObjectId, ref: 'Plant' }],
	/**
	 * Nutrients would just be a de-normalized view of the nutrients across the 
	 * phases. TODO:  decide if we need it as a property here
	 */
	//nutrients: [{ type: ObjectId, ref: 'Nutrient' }],
	//sensors: [{ type: ObjectId, ref: 'Sensor' }],
	//controls: [{ type: ObjectId, ref: 'Control'}],
	phases: [PhaseSchema],
	visibility : { type: String, enum: ['public', 'private'], default: 'public'}
});

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
		for (var j = i+1; j < length; j++){
			if (phaseName === phases[j].name){
				return next(new Error("Duplicate phase name. Phases in a grow plan must have unique names."));
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
 * @param callback {function} . function(err, result) to be called with result. result is a boolean,
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
/************************** END STATIC METHODS  ***************************/

GrowPlanModel = mongoose.model('GrowPlan', GrowPlanSchema);
exports.schema = GrowPlanSchema;
exports.model = GrowPlanModel;
