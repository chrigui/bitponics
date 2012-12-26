var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
  	ObjectId = Schema.ObjectId;

var ControlSchema = new Schema({
	name: { type: String, required: true },
	onAction: { type: ObjectId, ref: 'Action', required: false },
	offAction: { type: ObjectId, ref: 'Action', required: false }
});

ControlSchema.plugin(useTimestamps);

ControlSchema.suggestions = {
};

exports.schema = ControlSchema;
exports.model = mongoose.model('Control', ControlSchema);
