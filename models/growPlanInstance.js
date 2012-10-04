var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	GrowPlan = require('./growPlan').model,
	User = require('./user').model;

/**
 * GrowPlanInstance 
 */
var GrowPlanInstanceSchema = new Schema({

	gpid: { type: Number },

	users : [{ type: ObjectId, ref: 'User' }],
	
	owner : { type: ObjectId, ref: 'User', required: true },

	growPlan : { type : ObjectId, ref : 'GrowPlan', required: true},
	
	device : { type : ObjectId, ref : 'Device', required: false }, //the bitponics device
	
	startDate: { type: Date, required: true },

	endDate: { type: Date },

    active: { type: Boolean, required: true },

	phases: [{
		phase: { type: ObjectId, ref: 'Phase' },
		startDate: { type: Date },
		endDate: { type: Date },
		active: { type: Boolean }
	}],

	// not in use yet, but this will be how a user configures the view on their Dashboard
	settings : {
		visibleSensors : []
	},
	
	/**
	 * Sensor logs for the past 24 hours.
	 */
	recentSensorLogs: [{
		ts: { type: Date, required: true, default: Date.now },
		logs : [{
			/**
			 * sCode references to Sensor.code
			 */
			sCode: { type: String, ref: 'Sensor', required: true },
			value: { type: Number }
		}]
	}],
	
	/**
	 * Photo logs for the past 24 hours
	 */
	recentPhotoLogs: [{
		ts: { type: Date, required: true, default: Date.now },
		logs : [{
			url: { type : mongoose.SchemaTypes.Url, required: true},
			tags: { type : [String]}
		}]
	}],
	
	/**
	 * Tag Logs for the past 24 hours
	 */
	recentTagLogs: [{
		ts: { type: Date, required: true, default: Date.now },
		logs : [{
			entry: { type: String, required: true },
			tags: { type : [String]}
		}]
	}],
	visibility : { type: String, enum: ['public', 'private'], default: 'public'}
});

GrowPlanInstanceSchema.plugin(useTimestamps); // adds createdAt/updatedAt fields to the schema, and adds the necessary middleware to populate those fields 



/**
 * TODO : 
 * Returns number of milliseconds since the localized 00:00:00 of the phase start date
 * Used in cycle offset calculations. 
 
GrowPlanInstanceSchema.virtual('timeSinceActivePhaseStartDate')
	.get(function(){
		var now = new Date(),
			
	});
*/


GrowPlanInstanceSchema.index({ device: 1, active: 1 });



/**
 * Remove old recentSensorLogs
 */
GrowPlanInstanceSchema.pre('save', function(next){
	var now = Date.now(),
		cutoff = now - (1000 * 60 * 2), // now - 2 hours
		logsToRemove = [];
	
	this.recentSensorLogs.forEach(function(log){
		if (log.ts < cutoff) { logsToRemove.push(log); }
	});

	logsToRemove.forEach(function(log){
		log.remove();
	});

	next();
});

exports.model = mongoose.model('GrowPlanInstance', GrowPlanInstanceSchema);