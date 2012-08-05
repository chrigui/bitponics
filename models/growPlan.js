var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	useTimestamps = mongooseTypes.useTimestamps,
  	Schema = mongoose.Schema,
  	ObjectId = Schema.ObjectId,
  	GrowSystemSchema = require('./GrowSystem').schema;

var GrowPlanSchema = new Schema({
	parentGrowPlanId: { type: ObjectId },
	createdByUserId: { type: ObjectId },
	name: { type: String, required: true },
	description: { type: String, required: true },
	plants: [String],
	expertiseLevel: { type: String, enum: [
		'beginner',
		'intermediate',
		'expert'
	]},
	growSystem: { type: ObjectId, ref: 'GrowSystem' },
	light: [{ type: ObjectId, ref: 'Light'}],
	growMedium: { type: String, enum: [
		'hydroton',
		'cocoa chips',
		'cocoa coir',
		'perlite',
		'soil',
		'rockwool',
		'other'
	]},
	nutrients: [{ type: ObjectId, ref: 'Nutrient' }],
	sensors: [{ type: ObjectId, ref: 'Sensor' }],
	controls: [{ type: ObjectId, ref: 'Control'}],
	phases: [{ type: ObjectId, ref: 'Phase' }]
},
{ strict: true });

GrowPlanSchema.plugin(useTimestamps);

exports.model = mongoose.model('GrowPlan', GrowPlanSchema);
