var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

/**
 * PhotoLog
 */
var PhotoLogSchema = new Schema({
	/**
	 * The GrowPlanInstance
	 */
	gpi : { type: ObjectId, ref: 'GrowPlanInstance', required: true },

	/**
	 * timestamp
	 */
	ts: { type: Date, required: true, default: Date.now },

	logs : [{
		url: { type : mongoose.SchemaTypes.Url, required: true},
		tags: { type : [String]}
	}]
},
{ id : false });

PhotoLogSchema.index({ 'gpi ts logs.tags': -1 });

exports.schema = PhotoLogchema;
exports.model = mongoose.model('PhotoLog', PhotoLogSchema);