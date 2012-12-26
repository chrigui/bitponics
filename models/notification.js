var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
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
	 * The time to send the notification. 
	 * Once a notification is sent, this is set to null. 
	 * To clear pending notifications, this field is queried for values <= now 
	 */ 
	timeToSend : { type: Date, default: Date.now },


	/**
	 * If present, defines a repeat schedule for a notification.
	 * Once the notification is sent, it's used to update the 
	 * "timeToSend" field to the next time the notification should be sent
	 */
	repeat : {
	 	repeatType : { type: String, enum: [
			'seconds',
			'minutes',
			'hours',
			'days',
			'weeks',
			'months'
		]},
		duration : { type : Number },
		/*
		 * timezone
		 */
		tz : String
	},
	

	sentLogs : [ { ts : { type : Date } } ],


	/**
	 * Message. If sent over SMS, it's ellipsis-ed at 160 chars
	 */
	msg: { type: String },


	type : { type: String, enum: ["info","actionNeeded","error"]}
	// current triggers for notifications:
	// IdealRange violation that can be handled by device (type="info")
	// IdealRange violation that can't be handled by device (type="actionNeeded")
	// Phase Actions being started (at phase activation)
	// Actions triggered by IdealRange violations
	// Action cycles triggering repeating notifications
});

NotificationSchema.plugin(useTimestamps);


// Sparse index on timeToSend so that we skip nulls
NotificationSchema.index({ 'timeToSend gpi' : -1} , { sparse : true } );
//NotificationSchema.index({ 'gpi': 1 });


exports.schema = NotificationSchema;
exports.model = mongoose.model('Notification', NotificationSchema);