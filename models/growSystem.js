var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var GrowSystemSchema = new Schema({
	
	name: { type: String, required: true },
	
	description: { type: String, required: false },
	
	type: { type: String, required: true },
	
	/**
	 * reservoirSize is number of gallons
	 */
	reservoirSize: { type: Number },
	
	numberOfPlants: { type: Number, required: true }
});

GrowSystemSchema.plugin(useTimestamps);

/**
 * suggestions for auto-complete
 */
GrowSystemSchema.suggestions = {
	type: [
		'ebb & flow',
		'nutrient film technique (NFT)',
		'deep water culture (DWC)',
		'aquaponics'
	]
};

GrowSystemSchema.virtual('reservoirSizeWithUnits')
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


exports.schema = GrowSystemSchema;
exports.model = mongoose.model('GrowSystem', GrowSystemSchema);
