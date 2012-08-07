var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var LightSchema = new Schema({
	type: { type: String, required: true },
	watts: { type: Number },
	brand : { type : String },
	name : { type : String }
});

LightSchema.plugin(useTimestamps);

LightSchema.suggestions = {
	type: [
		'fluorescent',
		'metal halide',
		'high pressure sodium (HPS)',
		'LED'
	]
}

exports.schema = LightSchema;
exports.model = mongoose.model('Light', LightSchema);
