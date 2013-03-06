var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
  	ObjectId = Schema.ObjectId;

var LightBulbSchema = new Schema({
	type: { type : String, required : true },
	watts: { type : Number },
	brand : { type : String },
	name : { type : String }
},
{ id : false });

LightBulbSchema.plugin(useTimestamps);

LightBulbSchema.suggestions = {
	type: [
		'fluorescent',
		'metal halide',
		'high pressure sodium (HPS)',
		'LED'
	]
};

exports.schema = LightBulbSchema;
exports.model = mongoose.model('LightBulb', LightBulbSchema);
