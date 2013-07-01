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
  winston = require('winston'),
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
   * Will usually be a copy of a GPI's or Device's users
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
     * durationType
     */
	 	durationType : { type: String, enum: feBeUtils.DURATION_TYPES },
		
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
   * Storing the thing that triggered the notification.
   * Going to use this to group notifications together
   */
  trigger : {
    type : String,
    enum : [
      feBeUtils.NOTIFICATION_TRIGGERS.PHASE_END,
      feBeUtils.NOTIFICATION_TRIGGERS.PHASE_END_ACTION,
      feBeUtils.NOTIFICATION_TRIGGERS.PHASE_START,
      feBeUtils.NOTIFICATION_TRIGGERS.PHASE_ACTION,
      feBeUtils.NOTIFICATION_TRIGGERS.IDEAL_RANGE_VIOLATION,
      feBeUtils.NOTIFICATION_TRIGGERS.IMMEDIATE_ACTION,
      feBeUtils.NOTIFICATION_TRIGGERS.PHASE_ENDING_SOON,
      feBeUtils.NOTIFICATION_TRIGGERS.GROW_PLAN_UPDATE,
      feBeUtils.NOTIFICATION_TRIGGERS.DEVICE_MISSING
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
   * - deviceId {String}
   * - handledByDeviceControl {bool}
   * - cycleStateIndex {Number=}
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
  },
	

  /**
   * hash
   * MD5 hash of unique details (gpi + trigger + trigger details)
   */
  h : { type : String },

  /**
   * checked
   * User can "check" a notification log to hide it/mark completed
   *
   * TODO : decide what the behavior is if a repeating notification is marked checked
   */
  c : { type : Boolean }

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

NotificationSchema.virtual('checked')
.get(function(){
  return this.c;
})
.set(function(checked){
  this.c = checked;
})

NotificationSchema.virtual('hash')
  .get(function(){
    return this.h;
  })
  .set(function(hash){
    this.h = hash;
  });

NotificationSchema.virtual('gardenDashboardUrl')
  .get(function(){
    return "/gardens/" + getObjectId(this.gpi).toString() + "/?notification=" + this._id.toString();
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





/*************** INSTANCE METHODS *************************/
NotificationSchema.method('ensureHash', function(callback){
  if (!this.hash) { 
    var crypto = require('crypto'),
        stringToHash;
    
    stringToHash = (
      (this.gpi ? this.gpi.toString() : '') + 
      (JSON.stringify(this.r) || '') + 
      this.type + 
      this.trigger + 
      (JSON.stringify(this.triggerDetails) || '')
    );

    this.hash = crypto.createHash('md5').update(stringToHash).digest('hex');
  }
  return this.hash;
});

/*************** END INSTANCE METHODS *************************/



/*************** STATIC METHODS *************************/
/**
 * All new instances of Notification should be created with this method.
 * This method, by default, first checks whether we already have any existing duplicate of the submitted
 * notification that's active (tts is not null). If so, it returns that existing Notification.
 *
 *
 * @param {Object} options : Properties of the NotificationModel object. All properties are expected to be in friendly form, if a friendly form exists (virtual prop name)
 * @param {function(err, Notification)} callback
 */
NotificationSchema.static('create', function(options, callback){
  // TODO : Investigate the performance of this query. Assuming it'll be fine because
  // mongo can filter with the index we have on tts+gpi first, which
  // should greatly lessen the load
  
  var newNotification = new NotificationModel(options);
  newNotification.ensureHash();

  NotificationModel.findOne({
    h : newNotification.h
  })
  .exists('tts', true)
  .exec(function(err, notificationResult){
    if (err) { return callback(err); }
    if (notificationResult){
      return callback(null, notificationResult);
    }
    
    newNotification.save(callback);
  });
});


/**
 * Called when moving to new phases in a Grow Plan
 */
NotificationSchema.static('expireAllGrowPlanInstanceNotifications', function(growPlanInstanceId, callback){
  var now = new Date();

  NotificationModel
  .update(
    { gpi : growPlanInstanceId }, 
    { $unset : { 'tts' : 1 }},
    { multi : true }
  ).exec(callback);
});



/** 
 * Send all pending notifications to their recipients.
 *
 * Gets Notifications with "timeToSend" in the past, sends them, then resets "timeToSend"
 *
 * @param {'local'|'development'|'staging'|'production'} options.env
 * @param {function(err, numberResultsAffected)} callback
 */
NotificationSchema.static('clearPendingNotifications', function (options, callback){
  var ActionModel = require('./action').model,
      EmailConfig = require('../config/email-config'),
      nodemailer = require('nodemailer'),
      tz = require('timezone/loaded'),
      async = require('async'),
      winston = require('winston'),
      requirejs = require('../lib/requirejs-wrapper'),
      feBeUtils = requirejs('fe-be-utils'),
      i18nKeys = require('../i18n/keys'),
      ejs = require('ejs'),
      path = require('path'),
      fs = require('fs'),
      emailTemplates = require('email-templates'),
      emailTemplatesDir = path.join(__dirname, '/../views/emails'),
      notificationTemplateDirectory = path.join(__dirname, '/../views/notifications'),
      notificationTemplateTypes = ['email-subject', 'email-body-text', 'email-body-html', 'detail-html', 'summary-text'],
      compiledNotificationTemplates = {},
      secureAppUrl = 'https://' + (require('../config/app-domain-config')[options.env || 'local']),
      subscriptionPreferencesUrl = secureAppUrl + "/account/profile",
      logoUrl = 'http://' + (require('../config/app-domain-config')[options.env || 'local']) + "/assets/img/b-133w.png",
      now = new Date(),
      nowAsMilliseconds = now.valueOf();

  winston.info('IN clearPendingNotifications');

  NotificationModel
  .find()
  .where('tts')
  .lte(now)
  .populate('u', 'email') // only need the email field for Users
  .populate('gpi')
  .exec(function(err, notificationResults){
    if (err) { return callback(err); }
    if (!notificationResults.length){ return callback(null, 0); }

    // TEMP HACK : enable next line to disable emails
    //return callback(null, notificationResults.length);

    winston.info('IN clearPendingNotifications, PROCESSING ' + notificationResults.length + ' RESULTS');

    var emailTransport = nodemailer.createTransport("SES", EmailConfig.amazonSES.api);
    
    // Compile all the EJS templates
    Object.keys(feBeUtils.NOTIFICATION_TRIGGERS).forEach(function(key){
      var keyValue = feBeUtils.NOTIFICATION_TRIGGERS[key];
      compiledNotificationTemplates[keyValue] = {};

      notificationTemplateTypes.forEach(function(templateType){
        console.log("COMPILING " + keyValue + " " + templateType);
        compiledNotificationTemplates[keyValue][templateType] = ejs.compile(fs.readFileSync(path.join(notificationTemplateDirectory, keyValue, templateType + ".ejs"), 'utf8'));
        console.log("COMPLETED COMPILING " + keyValue + " " + templateType);
      });
    });

    async.waterfall(
      [
        function compileEmailTemplate(innerCallback){
          emailTemplates(emailTemplatesDir, innerCallback);
        },
        function processNotificationResults(runEmailTemplate, innerCallback){
          async.each(
            notificationResults, 
            function notificationIterator(notification, iteratorCallback){
              
              var notificationTemplateLocals = {
                notification : notification,
                NOTIFICATION_TYPES : feBeUtils.NOTIFICATION_TYPES,
                ACCESSORY_VALUES : feBeUtils.ACCESSORY_VALUES,
                secureAppUrl : secureAppUrl
              };

              // Populate trigger details
              async.parallel(
                [
                  function populateAction(innerCallback){
                    if (notification.triggerDetails.actionId){
                      ActionModel.findById(notification.triggerDetails.actionId)
                      .populate('control', 'name')
                      .exec(function(err, actionResult){
                        notificationTemplateLocals.action = actionResult;
                        return innerCallback(err);
                      });
                    }
                  },
                  function populateGrowPlan(innerCallback){
                    return innerCallback();
                  }
                ],
                function(err){
                  if (err) { return iteratorCallback(err); }

                  var emailTemplateLocals = {
                    emailSubject : compiledNotificationTemplates[notification.trigger]['email-subject'](notificationTemplateLocals),
                    emailBodyHtml : compiledNotificationTemplates[notification.trigger]['email-body-html'](notificationTemplateLocals),
                    emailBodyText : compiledNotificationTemplates[notification.trigger]['email-body-text'](notificationTemplateLocals),
                    subscriptionPreferencesUrl : subscriptionPreferencesUrl,
                    logoUrl : logoUrl
                  },
                  users = notification.users;

                  // TEMP HACK : special alert for hyatt device
                  winston.info("IN clearPendingNotifications, db " + NotificationModel.db.name);
                  
                  try {
                    if (NotificationModel.db.name.indexOf('prod') >= 0){
                      if ( (notification.trigger === feBeUtils.NOTIFICATION_TRIGGERS.DEVICE_MISSING) &&
                           (notification.triggerDetails.deviceId === '000666809f5b')
                         ){
                        
                        winston.info('IN clearPendingNotifications, special case adding bitponics team');
                        // TEMP HACK : remove Hyatt from email notifications
                        users = [{email : 'amit@bitponics.com'}, { email : 'michael@bitponics.com'}, {email : 'jack@bitponics.com'}];
                        emailTemplateLocals.emailSubject = "HYATT DEVICE CONNECTION DROPPED";
                      }
                    }
                  } catch(e){
                    winston.error(e.toString());
                  }

                  // TEMP HACK : send all emails to Amit
                  //users = [{email : 'amit@bitponics.com'}];

                  runEmailTemplate('default', emailTemplateLocals, function(err, finalEmailHtml, finalEmailText) {
                    if (err) { return iteratorCallback(err); }

                    var mailOptions = {
                      from: "notifications@bitponics.com",
                      to: users.map(function(user) { return user.email; }).join(', '),
                      subject: emailTemplateLocals.emailSubject,
                      text: finalEmailText,
                      html: finalEmailHtml
                    };

                    winston.info("IN clearPendingNotifications, ATTEMPTING TO SEND EMAIL NOTIFICATION TO " + mailOptions.to);
                    
                    emailTransport.sendMail(mailOptions, function(err, response){
                      if (err) { return iteratorCallback(err); }
                      
                      notification.sentLogs.push({ts: now});
                      
                      if (notification.repeat && notification.repeat.duration && notification.repeat.durationType){
                        winston.info("IN clearPendingNotifications, resetting notification.repeat", notification.timeToSend, notification.repeat.timezone, '+' + notification.repeat.duration + ' ' + notification.repeat.durationType)
                        notification.timeToSend = tz(notification.timeToSend, notification.repeat.timezone, '+' + notification.repeat.duration + ' ' + notification.repeat.durationType);
                        // Prevent notifications from getting stuck on repeat in the past...shouldn't actually ever happen
                        // if we've got notifications regularly being processed
                        if (notification.timeToSend.valueOf() < nowAsMilliseconds) { 
                          notification.timeToSend = now; 
                        }
                      } else {
                        notification.timeToSend = null;
                      }
                      
                      notification.save(iteratorCallback);
                    });
                  });
                }
              );
            },
            function notificationLoopEnd(err){
              return innerCallback(err, notificationResults.length);
            }
          );
        }
      ],
      function (err, numberResultsAffected){
        return callback(err, numberResultsAffected);
      }
    );
  });
});


/**
 *
 */
NotificationSchema.pre('save', function(next){
  this.markModified('triggerDetails');
  this.ensureHash();
  next();
});



// Sparse index on timeToSend so that we skip nulls
NotificationSchema.index({ 'tts gpi' : -1} , { sparse : true } );
NotificationSchema.index({ 'h' : 1 }, { sparse : true }); // TODO: shouldn't be sparse, but correct it after we've ensured all notifications have hash


exports.schema = NotificationSchema;
exports.model = NotificationModel = mongooseConnection.model('Notification', NotificationSchema);