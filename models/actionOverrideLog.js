var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

/**
 * ActionOverrideLog
 * Actions requested that weren't part of standard phase actions.
 * Manually triggered or IdealRange-triggered actions.
 */
var ActionOverrideLogSchema = new Schema({
	/**
	 * The GrowPlanInstance
	 */
	gpi : { type: ObjectId, ref: 'GrowPlanInstance', required: true },

	
	/**
	 * Message is a chance to explain what triggered this action,
	 * for example when actions are triggered by an IdealRange violation
	 */
	msg : { type : String, required: false },

	/**
	 * The time that this action was first requested, either through a sensor trigger or a manual trigger
	 */
	timeRequested: { type: Date, required: true, default: Date.now },
	
	/**
	 * The time this action was actually sent, either to the device or user
	 */
	timeSent: { type: Date },
	
	/**
	 * This should be set at the time the record is created. Device logic will use this
	 * to determine what action overrides should still be active
	 */
 	expires : { type : Date , required : true },

	/**
	 * Reference to the action
	 */
	action : {type: ObjectId, ref: 'Action', required: true },
	
	/**
	 * "Done" status of the action. Device actions are automatically marked as done.
	 * Actions that require user action might require the user to mark it as done...but
	 * that's not implemented. For now we'll just mark this as true whenever an action is sent.
	 */
	done: {type : Boolean, default : false }
},
{ id : false });

ActionOverrideLogSchema.index({ 'gpi expires timeSent': -1 });

exports.schema = ActionOverrideLogSchema;
exports.model = mongoose.model('ActionOverrideLog', ActionOverrideLogSchema);