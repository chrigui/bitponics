var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var GrowSystemSchema = new Schema({
	name: { type: String, required: true }
});

GrowSystemSchema.plugin(useTimestamps);

//
GrowSystemSchema.suggestions = {
	name: [
		'ebb & flow',
		'nutrient film technique (NFT)',
		'deep water culture',
		'aquaponics'
	]
}

exports.schema = GrowSystemSchema;
exports.model = mongoose.model('GrowSystem', GrowSystemSchema);
