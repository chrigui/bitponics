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
	tags: [String],
	expertiseLevel: { type: String, enum: [
		'beginner',
		'intermediate',
		'expert'
	]},
	growSystemType: { type: ObjectId, ref: 'GrowSystem' },
	light: [{ type: ObjectId, ref: 'Light'}],
	numberOfPlants: Number,
	growMedium: { type: String, enum: [
		'hydroton',
		'cocoa chips',
		'cocoa coir',
		'perlite',
		'soil',
		'rockwool',
		'other'
	]},
	reservoir_size: { type: Number },
	nutrients: [{ type: ObjectId, ref: 'Nutrient' }],
	sensor_list: [{ type: ObjectId, ref: 'Sensor' }],
	controls: [{ type: ObjectId, ref: 'Control'}],
	phases: [{ type: ObjectId, ref: 'Phase' }]
},
{ strict: true });

GrowPlanSchema.plugin(useTimestamps);
GrowPlanSchema.virtual('reservoirSizeWithUnits')
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

exports.model = mongoose.model('GrowPlan', GrowPlanSchema);
