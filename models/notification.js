var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils'),
	ObjectId = Schema.ObjectId;


var NotificationSentLogSchema = new Schema({ 
  /**
   * timestamp
   */
  ts : { type : Date } 
},
{ _id : false, id : false });

NotificationSentLogSchema.virtual('timestamp')
.get(function(){
  return this.ts;
})
.set(function(timestamp){
  this.ts = timestamp;
})

/**
 * Notification
 * 
 * Current triggers for notifications:
 * IdealRange violation that can be handled by device (type="info")
 * IdealRange violation that can't be handled by device (type="actionNeeded")
 * Phase Actions being started (at phase activation)
 * Actions triggered by IdealRange violations
 * Action cycles that aren't handled by device triggering repeating notifications
 */
var NotificationSchema = new Schema({
	

	/**
   * users
   * Users to send the notification to.
   */
  u : [{ type: ObjectId, ref: 'User', required: true }],


	/**
	 * GrowPlanInstance. Optional.
	 */
	gpi: { type: ObjectId, ref: 'GrowPlanInstance', required: false },


	/**
	 * timeToSend
   * The time to send the notification. 
	 * Once a notification is sent and has no further repeats, this is set to null. 
	 * To clear pending notifications, this field is queried for values <= now
	 */ 
	tts : { type: Date, default: Date.now },


	/**
	 * repeat
   * If present, defines a repeat schedule for a notification.
	 * Once the notification is sent, it's used to update the 
	 * "timeToSend" field to the next time the notification should be sent
	 */
	r : {
    /**
     * repeatType
     */
	 	repeatType : { type: String, enum: feBeUtils.DURATION_TYPES },
		
    /**
     * duration
     */
    duration : { type : Number },
		
    /*
		 * timezone
		 */
		timezone : String
	},
	

  /**
   * sentLogs
   */
	sl : [ NotificationSentLogSchema ],


	/**
	 * message
   * If sent over SMS, it's ellipsis-ed at 160 chars
	 */
	m: { type: String },


  /**
   * type
   */
	t : { type: String, enum: feBeUtils.NOTIFICATION_TYPES }
	

},
{ id : false });

NotificationSchema.plugin(useTimestamps);



NotificationSchema.virtual('users')
  .get(function(){
    return this.u;
  })
  .set(function(users){
    this.u = users;
  });

NotificationSchema.virtual('growPlanInstance')
  .get(function(){
    return this.gpi;
  })
  .set(function(growPlanInstance){
    this.gpi = growPlanInstance;
  });

NotificationSchema.virtual('timeToSend')
  .get(function(){
    return this.tts;
  })
  .set(function(timeToSend){
    this.tts = timeToSend;
  });

NotificationSchema.virtual('repeat')
  .get(function(){
    return this.r;
  })
  .set(function(repeat){
    this.r = repeat;
  });

/*
NotificationSchema.virtual('r.repeatType')
  .get(function(){
    return this.r.rt;
  })
  .set(function(repeatType){
    this.r.rt = repeatType;
  });

NotificationSchema.virtual('r.duration')
  .get(function(){
    return this.r.d;
  })
  .set(function(duration){
    this.r.d = duration;
  });

NotificationSchema.virtual('r.timezone')
  .get(function(){
    return this.r.tz;
  })
  .set(function(timezone){
    this.r.tz = timezone;
  });
*/

NotificationSchema.virtual('sentLogs')
  .get(function(){
    return this.sl;
  })
  .set(function(sentLogs){
    this.sl = sentLogs;
  });

NotificationSchema.virtual('message')
  .get(function(){
    return this.m;
  })
  .set(function(message){
    this.m = message;
  });

/**
 * tmp virtual until we clean the code and refactor all refs to use "message"
 */
NotificationSchema.virtual('msg')
  .get(function(){
    return this.m;
  })
  .set(function(message){
    this.m = message;
  });

NotificationSchema.virtual('type')
  .get(function(){
    return this.t;
  })
  .set(function(type){
    this.t = type;
  });  



/*************** SERIALIZATION *************************/

/**
 * Remove the db-only-optimized property names and expose only the friendly names
 *
 * "Transforms are applied to the document and each of its sub-documents"
 * http://mongoosejs.com/docs/api.html#document_Document-toObject
 */
NotificationSchema.set('toObject', {
  getters : true,
  transform : function(doc, ret, options){
    if (doc.schema === NotificationSentLogSchema){
      delete ret.ts;
    } else {
      // else we're operating on the parent doc (the NotificationSchema doc)
      delete ret.u;
      delete ret.gpi;
      delete ret.tts;
      delete ret.r;
      delete ret.sl;
      delete ret.m;
      delete ret.t;
    }
  }
});
NotificationSchema.set('toJSON', {
  getters : true,
  transform : NotificationSchema.options.toObject.transform
});
/*************** END SERIALIZATION *************************/


// Sparse index on timeToSend so that we skip nulls
NotificationSchema.index({ 'tts gpi' : -1} , { sparse : true } );
//NotificationSchema.index({ 'gpi': 1 });


exports.schema = NotificationSchema;
exports.model = mongoose.model('Notification', NotificationSchema);