var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var PhaseSchema = new Schema({
	
	name: { type: String, required: true },
	
	/**
	 * expectedNumberOfDays. undefined means infinite.
	 */
	expectedNumberOfDays: { type: Number, required: false },
	
	light: { type: ObjectId, ref: 'Light', required: false },
	
	actions: [{ type: ObjectId, ref: 'Action', required: true }],
	
	idealRanges: [{ type: ObjectId, ref: 'IdealRange', required: false }],
});

PhaseSchema.plugin(useTimestamps);

/**
 * suggestions for auto-complete
 */
PhaseSchema.suggestions = {
}

exports.schema = PhaseSchema;
exports.model = mongoose.model('Phase', PhaseSchema);