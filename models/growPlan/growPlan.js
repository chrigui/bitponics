var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	mongoosePlugins = require('../../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
  	Schema = mongoose.Schema,
  	ObjectId = Schema.ObjectId,
  	PhaseSchema = require('./phase').schema;

var GrowPlanSchema = new Schema({
	parentGrowPlanId: { type: ObjectId, ref: 'GrowPlan' },
	createdBy: { type: ObjectId, ref: 'User' },
	name: { type: String, required: true },
	description: { type: String, required: true },
	plants: [{ type: ObjectId, ref: 'Plant' }],
	expertiseLevel: { type: String, enum: [
		'beginner',
		'intermediate',
		'expert'
	]},
	
	/**
	 * Nutrients would just be a de-normalized view of the nutrients across the 
	 * phases. TODO:  decide if we need it as a property here
	 */
	//nutrients: [{ type: ObjectId, ref: 'Nutrient' }],
	sensors: [{ type: ObjectId, ref: 'Sensor' }],
	controls: [{ type: ObjectId, ref: 'Control'}],
	phases: [PhaseSchema],
	visibility : { type: String, enum: ['public', 'private'], default: 'public'}
});

GrowPlanSchema.plugin(useTimestamps);


/************************** STATIC METHODS  ***************************/

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

/************************** END STATIC METHODS  ***************************/


/************************** INSTANCE METHODS  ***************************/

/*
 * Given a number of days into the GrowPlan, find
 * the target phase & number of days into the phase.
 * If numberOfDays exceeds total span of GrowPlan,
 * returns last day of last phase
 * 
 * @param numberOfDays
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


/*
 * Given another GrowPlan object, determine whether
 * they're equivalent enough to say they're "equal".
 * Comparing only salient properties; ignoring properties 
 * like createdAt/updatedAt
 * 
 * @param otherGrowPlan. GrowPlan model object
 * @param callback. function(err, result) to be called with result. result is a boolean,
 * 					true if the objects are equivalent, false if not
 *
 */
GrowPlanSchema.method('isEquivalentTo', function(otherGrowPlan, callback){
	var growPlan = this;

	// compare name
	if (this.name !== otherGrowPlan.name) { return callback(null, false); }


	// compare description
	if (this.description !== otherGrowPlan.description) { return callback(null, false); }


	// compare plants
	if (this.plants.length !== otherGrowPlan.plants.length) { return callback(null, false); }
	// TODO : this loop can probably be optimized
	var allPlantsFound = true;
	for (var i = 0, length = this.plants.length; i < length; i++){
		var plantName = this.plants[i].name,
			plantFound = false;
		for (var j = 0; j < length; j++){
			if (plantName === otherGrowPlan.plants[j].name){
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
	if (this.phases.length !== otherGrowPlan.phases.length) { return callback(null, false); }
	
	
	// Now that we've passed all of the shallow comparisons, 
	// we need to do all of the async comparisons
	var allAsyncEquivalenceChecksPassed = true;
	async.parallel(
		[
			function phasesComparison(innerCallback){
				var allPhasesAreEquivalent = true;
				async.forEach(this.phases, 
					function phaseIterator(phase, phaseCallback){
						var otherPhase = otherGrowPlan.phases[growPlan.indexOf(phase)];
						return phase.isEquivalentTo(otherPhase, function(err, isEquivalent){
							if (!isEquivalent){
								allPhasesAreEquivalent = false;
								// TODO : short-circuit the async loop by calling callback with an error?
							}
							return innerCallback();
						});
					},
					function phaseLoopEnd(err){
						if (!allPhasesAreEquivalent){
							allAsyncEquivalenceChecksPassed = false;
						}
						return innerCallback(err, allPhasesAreEquivalent);
					}
				);
			}
		],
		function parallelComparisonEnd(err, results){
			return callback(err, allAsyncEquivalenceChecksPassed)
		}
	);
});

/************************** END INSTANCE METHODS  ***************************/

exports.schema = GrowPlanSchema;
exports.model = mongoose.model('GrowPlan', GrowPlanSchema);
