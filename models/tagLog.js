var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

/**
 * TagLog
 */
var TagLogSchema = new Schema({
	/**
	 * The GrowPlanInstance
	 */
	gpi : { type: ObjectId, ref: 'GrowPlanInstance', required: true },

	/**
	 * timestamp
	 */
	ts: { type: Date, required: true, default: Date.now },

	logs : [{
		val: { type : String, required: true},
		tags: { type : [String]}
	}]
});

TagLogSchema.index({ 'gpi ts logs.tags': -1 });

exports.schema = TagLogchema;
exports.model = mongoose.model('TagLog', TagLogSchema);