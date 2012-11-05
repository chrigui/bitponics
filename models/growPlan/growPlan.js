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
	plants: [String],
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

exports.schema = GrowPlanSchema;
exports.model = mongoose.model('GrowPlan', GrowPlanSchema);
