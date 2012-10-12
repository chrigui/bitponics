var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

/**
 * Notification
 */
var NotificationSchema = new Schema({
	
	users : [{ type: ObjectId, ref: 'User', required: true }],

	/**
	 * GrowPlanInstance. Optional.
	 */
	gpi: { type: ObjectId, ref: 'GrowPlanInstance', required: false },
	

	/**
	 * Timestamp
	 */
	ts: { type: Date, required: true, default: Date.now },


	/**
	 * time that we actually sent the email/SMS, if applicable. If
	 * this was a dashboard-only notification, this is set to the same time
	 * as ts. 
	 * If we go with a db-worker approach, the worker
	 * would query this for "null" to find notifications
	 * that still need to be sent. 
	 */
	timeSent : { type: Date, required: false },


	/**
	 * Message. If sent over SMS, it's ellipsis-ed at 160 chars
	 */
	msg: { type: String },


	type : { type: String, enum: ["info","actionNeeded","error"]},

	/**
	 * Boolean flag indicating whether this notification has been viewed.
	 * This is applicable mostly for notifications presented in the "Notifications" area in the dashboard.
	 * User will be able to "X" out the notification to set this to true,
	 * or maybe we'll set it to true algorithmically somehow.
	 */
	viewed : { type : Boolean, default: false }
});

NotificationSchema.index({ 'timeSent users': -1 });
NotificationSchema.index({ 'gpi ts viewed': 1 });

exports.schema = NotificationSchema;
exports.model = mongoose.model('Notification', NotificationSchema);