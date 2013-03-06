var mongoose = require('mongoose'),
    mongooseTypes = require('mongoose-types'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var HarvestReadingSchema = new Schema({
    p: { type : ObjectId, ref: 'Plant', required: true},
    /**
     * Value of HarvestLog is stored as weight in kilograms.
     * Localized at the view level depending on user settings
     */
    w: { type : Number, required: true}
},
/**
 * Prevent the _id property since these will only ever be subdocs in HarvestLog, don't need
 * ObjectIds created on them
 */
{ _id : false, id : false } );

HarvestReadingSchema.virtual('plant')
    .get(function(){
        return this.p;
    })
    .set(function(plant){
        this.p = plant;
    });
HarvestReadingSchema.virtual('weight')
    .get(function(){
        return this.w;
    })
     .set(function(weight){
        this.w = weight;
    });


/**
 * HarvestLog
 */
var HarvestLogSchema = new Schema({
    /**
     * The GrowPlanInstance
     */
    gpi : { type: ObjectId, ref: 'GrowPlanInstance', required: true },

    /**
     * timestamp
     */
    ts: { type: Date, required: true, default: Date.now },

    /**
     * logs
     */
    l : [HarvestReadingSchema]
},
{ id : false });

HarvestLogSchema.virtual('logs')
    .get(function () {
        return this.l;
    })
    .set(function(logs){
        this.l = logs;
    });

HarvestLogSchema.index({ 'gpi ts plant': -1 });

exports.schema = HarvestLogSchema;
exports.model = mongoose.model('HarvestLog', HarvestLogSchema);