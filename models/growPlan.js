var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	useTimestamps = mongooseTypes.useTimestamps,
  	Schema = mongoose.Schema,
  	ObjectId = Schema.ObjectId,
  	GrowSystemSchema = require('./growSystem').schema;

var GrowPlanSchema = new Schema({
	parentGrowPlanId: { type: ObjectId, ref: 'GrowPlan' },
	createdByUserId: { type: ObjectId, ref: 'User' },
	name: { type: String, required: true },
	description: { type: String, required: true },
	plants: [String],
	expertiseLevel: { type: String, enum: [
		'beginner',
		'intermediate',
		'expert'
	]},
	growSystem: { type: ObjectId, ref: 'GrowSystem' },
	growMedium: { type: String },
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
