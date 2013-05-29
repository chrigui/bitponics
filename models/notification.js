var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils'),
	ObjectIdSchema = Schema.ObjectId,
  ObjectId = mongoose.Types.ObjectId,
  mongooseConnection = require('../config/mongoose-connection').defaultConnection,
  async = require('async'),
  utils = require('./utils'),
  getObjectId = utils.getObjectId,
  NotificationModel;


var NotificationSentLogSchema = new Schema({ 
  /**
   * timestamp
   */
  ts : { type : Date },

  /**
   * checked
   * User can "check" a notification log to hide it/mark completed
   */
  c : { type : Boolean }
},
{ _id : false, id : false });

NotificationSentLogSchema.virtual('timestamp')
.get(function(){
  return this.ts;
})
.set(function(timestamp){
  this.ts = timestamp;
})

NotificationSentLogSchema.virtual('checked')
.get(function(){
  return this.c;
})
.set(function(checked){
  this.c = checked;
})

/**
 * Notification
 * 
 * - IdealRange violation that can be handled by device (type="info")
 * - IdealRange violation that can't be handled by device (type="actionNeeded")
 * - Phase Actions being started (at phase activation) 
 * - Actions triggered by IdealRange violations
 * - Action cycles that aren't handled by device triggering repeating notifications (type="actionNeeded")
 * - GrowPlan was updated and we updated your Garden to use it
 * - GrowPlan was updated but we couldn't automatically update your garden. Come select which phase of the new Grow Plan to use
 */
var NotificationSchema = new Schema({
	

	/**
   * users
   * Users to send the notification to.
   */
  u : [{ type: ObjectIdSchema, ref: 'User', required: true }],


	/**
	 * GrowPlanInstance. Optional.
	 */
	gpi: { type: ObjectIdSchema, ref: 'GrowPlanInstance', required: false },


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
   * title
   *
   * Plain-text title
   *
   * Emails: Becomes the header (and subject?),
   * Dashboard: Becomes the default view (user needs to click to show detail (body))
   * SMS : ?
   */
  t : { type : String },
  
  
  /**
   * body
   * 
   * Plain-text body
   *
   * Emails: Becomes the header (and subject?),
   * Dashboard: Becomes the default view (user needs to click to show detail (body))
   * SMS : ?
   */
  b : { type: String },

  
  /**
   * template
   *
   * Name of the HTML template to use for email rendering
   */
  tmpl : { type : String },

  
  /**
   * Storing the thing that triggered the notification.
   * Going to use this to group notifications together
   */
  trigger : {
    type : String,
    enum : [
      feBeUtils.NOTIFICATION_TRIGGERS.PHASE_END,
      feBeUtils.NOTIFICATION_TRIGGERS.PHASE_START,
      feBeUtils.NOTIFICATION_TRIGGERS.IDEAL_RANGE_VIOLATION,
      feBeUtils.NOTIFICATION_TRIGGERS.GROW_PLAN_UPDATE,
      feBeUtils.NOTIFICATION_TRIGGERS.IMMEDIATE_ACTION,
      feBeUtils.NOTIFICATION_TRIGGERS.PHASE_ENDING_SOON
      //feBeUtils.NOTIFICATION_TRIGGERS.SCHEDULED_MANUAL_PHASE_ACTION,
    ],
    required : true
  },

  
  /**
   * Mixed object type to let Notification triggers
   * store any pertinent data, intended to be interpolated
   * into the messages that are emailed or whatever
   * 
   * Current properties in use:
   * - phaseName {String}
   * - gpiPhaseId {ObjectId}
   * - gpPhaseId {ObjectId}
   * - actionId {ObjectId}
   * - idealRangeId {ObjectId}
   * - newGrowPlanId {ObjectId}
   */
  triggerDetails : Schema.Types.Mixed,

  
  /**
   * type
   */
	type : { 
    type: String, 
    enum: [
      feBeUtils.NOTIFICATION_TYPES.INFO,
      feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED,
      feBeUtils.NOTIFICATION_TYPES.ERROR
    ],
    required : true,
    default : feBeUtils.NOTIFICATION_TYPES.INFO
  }
	

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


NotificationSchema.virtual('title')
  .get(function(){
    return this.t;
  })
  .set(function(title){
    this.t = title;
  });


NotificationSchema.virtual('body')
  .get(function(){
    return this.b;
  })
  .set(function(body){
    this.b = body;
  });


NotificationSchema.virtual('template')
  .get(function(){
    return this.tmpl;
  })
  .set(function(template){
    this.tmpl = template;
  });



NotificationSchema.virtual('gardenDashboardUrl')
  .get(function(){
    var appDomain = 'www.bitponics.com';//require('../app').config.appDomain;
    return "https://" + appDomain + "/gardens/" + getObjectId(this.gpi).toString() + "/?notification=" + this._id.toString();
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
      delete ret.c;
    } else {
      // else we're operating on the parent doc (the NotificationSchema doc)
      delete ret.u;
      delete ret.gpi;
      delete ret.tts;
      delete ret.r;
      delete ret.sl;
      delete ret.t;
      delete ret.tmpl;
      delete ret.b;
    }
  }
});
NotificationSchema.set('toJSON', {
  getters : true,
  transform : NotificationSchema.options.toObject.transform
});
/*************** END SERIALIZATION *************************/






/**
 * All new instances of Notification should be created with this method.
 * This method, by default, first checks whether we already have any existing duplicate of the submitted
 * notification already exists. If so, it returns that existing Notification.
 *
 * TODO : should investigate how to compare against triggerDetails. Maybe make triggerDetails serialized JSON, provide a getter for deserialized. Then we can query for equality
 *
 * @param {Object} options : Properties of the NotificationModel object. All properties are expected to be in friendly form, if a friendly form exists (virtual prop name)
 * @param {function(err, Notification)} callback
 */
NotificationSchema.static('create', function(options, callback){
  // TODO : Investigate the performance of this query. Assuming it'll be fine because
  // mongo can filter with the index we have on tts+gpi first, which
  // should greatly lessen the load
  NotificationModel.find({
    gpi : options.gpi || options.growPlanInstance,
    tts : { $gte : options.timeToSend },
    type : options.type,
    trigger : options.trigger,
    t : options.title,
    b : options.body,
    url : options.url,
    tmpl : options.template
  }).exec(function(err, notificationResults){
    if (err) { return callback(err); }
    if (notificationResults.length){
      return callback(null, notificationResults[0]);
    }
    var newNotification = new NotificationModel(options);
    newNotification.save(callback);
  });
});



NotificationSchema.static('expireAllGrowPlanInstanceNotifications', function(growPlanInstanceId, callback){
  var now = new Date();

  NotificationModel
  .update(
    { gpi : growPlanInstanceId, tts : { $gte : now }}, 
    { $unset : { 'tts' : 1 }}
  ).exec(callback);
});



// Sparse index on timeToSend so that we skip nulls
NotificationSchema.index({ 'tts gpi' : -1} , { sparse : true } );


exports.schema = NotificationSchema;
exports.model = NotificationModel = mongooseConnection.model('Notification', NotificationSchema);