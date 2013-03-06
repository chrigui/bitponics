var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
  	ObjectId = Schema.ObjectId;

var LightFixtureSchema = new Schema({
	brand : { type : String },
	name : { type : String, required: true},
	type : { type : String },
	watts : { type : Number },
	/**
	 * Number of bulbs the fixture holds
	 */
	bulbCapacity : { type : Number, default:  1 }
},
{ id : false });

LightFixtureSchema.plugin(useTimestamps);

LightFixtureSchema.suggestions = {
	type: [
		'fluorescent',
		'metal halide',
		'high pressure sodium (HPS)',
		'LED'
	]
}

exports.schema = LightFixtureSchema;
exports.model = mongoose.model('LightFixture', LightFixtureSchema);
