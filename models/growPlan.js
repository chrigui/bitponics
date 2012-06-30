var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	useTimestamps = mongooseTypes.useTimestamps,
  	Schema = mongoose.Schema,
  	ObjectId = Schema.ObjectId,
  	GrowSystemSchema = require('./GrowSystem').schema;

var GrowPlanSchema = new Schema({
	title: { type: String, required: true },
	growSystemType: { type: String, enum: [
		'ebb & flow',
		'nutrient film technique (NFT)',
		'deep water culture',
		'aquaponics'
	]},
	description: { type: String, required: true },    
	tags: [String],
	expertiseLevel: { type: String, enum: [
		'beginner',
		'intermediate',
		'expert'
	]},
	supplementalLightingType: { type: String, enum: [
		'fluorescent',
		'metal halide',
		'none',
		'high pressure sodium (HPS)'
	]},
	numberOfPlants: Number,
	growingMedium: { type: String, enum: [
		'hydroton',
		'cocoa chips',
		'cocoa coir',
		'perlite',
		'soil',
		'rockwool',
		'other'
	]},
	reservoir_size: { type: String },
	nutrients: { type: Array },
	sensor_list: { type: Array }, 
	phases: { type: Array }
},
{ strict: true });

GrowPlanSchema.plugin(useTimestamps);

exports.model = mongoose.model('GrowPlan', GrowPlanSchema);
