var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
  	Schema = mongoose.Schema,
  	ObjectId = Schema.ObjectId,
  	GrowSystemSchema = require('./growSystem').schema;

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
	nutrients: [{ type: ObjectId, ref: 'Nutrient' }],
	sensors: [{ type: ObjectId, ref: 'Sensor' }],
	controls: [{ type: ObjectId, ref: 'Control'}],
	phases: [{ type: ObjectId, ref: 'Phase' }]
},
{ strict: true });

GrowPlanSchema.plugin(useTimestamps);

GrowPlanSchema.suggestions = {
	growMedium : [
		'hydroton',
		'cocoa chips',
		'cocoa coir',
		'perlite',
		'soil',
		'rockwool'
	]
};

exports.model = mongoose.model('GrowPlan', GrowPlanSchema);
