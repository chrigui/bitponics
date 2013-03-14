var mongoose = require('mongoose'),
  mongooseTypes = require('mongoose-types'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

/**
 * ImmediateActionLog
 * Actions requested that weren't part of standard phase actions.
 * Manually triggered or IdealRange-triggered actions.
 */
var ImmediateActionLogSchema = new Schema({
    /**
     * The GrowPlanInstance
     */
    gpi : { type: ObjectId, ref: 'GrowPlanInstance', required: true },


    /**
     * message (virtual)
     * Message is a chance to explain what triggered this action,
     * for example when actions are triggered by an IdealRange violation
     */
    m : { type : String, required: false },

    /**
     * timeRequested (virtual)
     * The time that this action was first requested, either through a sensor trigger or a manual trigger
     */
    tr: { type: Date, required: true, default: Date.now },

    /**
     * timeSent (virtual)
     * The time this action was actually sent, either to the device or user
     */
    ts: { type: Date },

    /**
     * expires (virtual)
     * This should be set at the time the record is created. Device logic will use this
     * to determine what action overrides should still be active
     */
    e : { type : Date , required : true },

    /**
     * action (virtual)
     * Reference to the action
     */
    a : {type: ObjectId, ref: 'Action', required: true },

    /**
     * done (virtual)
     * "Done" status of the action. Device actions are automatically marked as done.
     * Actions that require user action might require the user to mark it as done...but
     * that's not implemented. For now we'll just mark this as true whenever an action is sent.
     */
    d: {type : Boolean, default : false }
  },
  { id : false });


ImmediateActionLogSchema.virtual('growPlanInstance')
  .get(function(){
    return this.gpi;
  })
  .set(function(growPlanInstance){
    this.gpi = growPlanInstance;
  });

ImmediateActionLogSchema.virtual('message')
  .get(function(){
    return this.m;
  })
  .set(function(message){
    this.m = message;
  });

ImmediateActionLogSchema.virtual('timeRequested')
  .get(function(){
    return this.tr;
  })
  .set(function(timeRequested){
    this.tr = timeRequested;
  });

ImmediateActionLogSchema.virtual('timeSent')
  .get(function(){
    return this.ts;
  })
  .set(function(timeSent){
    this.ts = timeSent;
  });

ImmediateActionLogSchema.virtual('expires')
  .get(function(){
    return this.e;
  })
  .set(function(expires){
    this.e = expires;
  });

ImmediateActionLogSchema.virtual('action')
  .get(function(){
    return this.a;
  })
  .set(function(action){
    this.a = action;
  });

ImmediateActionLogSchema.virtual('done')
  .get(function(){
    return this.d;
  })
  .set(function(done){
    this.d = done;
  });


/*************** SERIALIZATION *************************/

/**
 * Remove the db-only-optimized property names and expose only the friendly names
 *
 * "Transforms are applied to the document and each of its sub-documents"
 * http://mongoosejs.com/docs/api.html#document_Document-toObject
 */
ImmediateActionLogSchema.set('toObject', {
  getters : true,
  transform : function(doc, ret, options){
    delete ret.gpi;
    delete ret.tr;
    delete ret.ts;
    delete ret.e;
    delete ret.a;
    delete ret.d;
    delete ret.m;
  }
});
ImmediateActionLogSchema.set('toJSON', {
  getters : true,
  transform : ImmediateActionLogSchema.options.toObject.transform
});
/*************** END SERIALIZATION *************************/



ImmediateActionLogSchema.index({ 'gpi e ts': -1 });

exports.schema = ImmediateActionLogSchema;
exports.model = mongoose.model('ImmediateActionLog', ImmediateActionLogSchema);