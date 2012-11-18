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
 *
 * @return boolean. True if GrowPlans are equivalent, false if not
 *
 */
GrowPlanSchema.method('isEquivalentTo', function(otherGrowPlan){
	
	if (this.name !== otherGrowPlan.name) { return false; }

	if (this.description !== otherGrowPlan.description) { return false; }

	if (this.plants.length !== otherGrowPlan.plants.length) { return false; }
	
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
		return false;
	}
	
	return true;
});

/************************** END INSTANCE METHODS  ***************************/

exports.schema = GrowPlanSchema;
exports.model = mongoose.model('GrowPlan', GrowPlanSchema);
