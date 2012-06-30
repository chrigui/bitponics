var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	useTimestamps = mongooseTypes.useTimestamps,
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	GrowPlan = require('./growPlan').model,
	User = requre('./user').model;

/**
 * GrowPlanInstance 
 */
var GrowPlanInstanceSchema = new Schema({
	growPlan : { type : ObjectId, ref : 'GrowPlan', required: true},
	users : [{ type: ObjectId, ref: 'User'}],
	photos : {
		url : { type : mongoose.SchemaTypes.Url, required: true},
		createdAt : { type : Date, default: Date.now},
		tags: { type : [String]}
	}
},
{ strict: true });

GrowPlanInstanceSchema.plugin(useTimestamps); // adds createdAt/updatedAt fields to the schema, and adds the necessary middleware to populate those fields 

exports.model = mongoose.model('GrowPlanInstance', GrowPlanInstanceSchema);