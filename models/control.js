var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	ObjectIdSchema = Schema.ObjectId,
  mongooseConnection = require('../config/mongoose-connection').defaultConnection;

var ControlSchema = new Schema({
	name: { type: String, required: true },
	onAction: { type: ObjectIdSchema, ref: 'Action', required: false },
	offAction: { type: ObjectIdSchema, ref: 'Action', required: false },
  createdBy: { type: ObjectIdSchema, ref: 'User'}
},
{ id : false });

ControlSchema.plugin(useTimestamps);
ControlSchema.plugin(mongoosePlugins.recoverableRemove);

exports.schema = ControlSchema;
exports.model = mongooseConnection.model('Control', ControlSchema);