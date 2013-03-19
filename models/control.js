var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	ObjectIdSchema = Schema.ObjectId;

var ControlSchema = new Schema({
	name: { type: String, required: true },
	onAction: { type: ObjectIdSchema, ref: 'Action', required: false },
	offAction: { type: ObjectIdSchema, ref: 'Action', required: false },
  createdBy: { type: ObjectIdSchema, ref: 'User'}
},
{ id : false });

ControlSchema.plugin(useTimestamps);

exports.schema = ControlSchema;
exports.model = mongoose.model('Control', ControlSchema);
