var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var NutrientSchema = new Schema({
	brand: { type: String, required: true },
	name: { type: String, required: true }
});

NutrientSchema.plugin(useTimestamps);

exports.schema = NutrientSchema;
exports.model = mongoose.model('Nutrient', NutrientSchema);
