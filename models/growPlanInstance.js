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
	
	growPlan : { type : ObjectId, ref : 'GrowPlan', required: true},
	
	device : { type : ObjectId, ref : 'Device', required: false }, //the bitponics device
	
	startDate: { type: Date, required: true },

	endDate: { type: Date, required: true },

    active: { type: Boolean, required: true },

	phases: [{
		phase: { type: ObjectId, ref: 'Phase' },
		startDate: { type: Date },
		endDate: { type: Date },
		active: { type: Boolean }
	}],

	sensorLogs: [{
		timestamp: { type: Date, required: true, default: Date.now },
		logs : [{
			sensor: { type: ObjectId, ref: 'Sensor', required: true },
			value: { type: Number }
		}]
	}],
	
	controlLogs: [{
		timestamp: { type: Date, required: true, default: Date.now },
		logs : [{
			control: { type: ObjectId, ref: 'Control', required: true },
			value: { type: Number }
		}]
	}],
	
	photoLogs: [{
		timestamp: { type: Date, required: true, default: Date.now },
		logs : [{
			url: { type : mongoose.SchemaTypes.Url, required: true},
			tags: { type : [String]}
		}]
	}],
	
	genericLogs: [{
		timestamp: { type: Date, required: true, default: Date.now },
		logs : [{
			entry: { type: String, required: true },
			tags: { type : [String]},
			logType: { type: String }
		}]
	}]
},
{ strict: true });

GrowPlanInstanceSchema.plugin(useTimestamps); // adds createdAt/updatedAt fields to the schema, and adds the necessary middleware to populate those fields 


GrowPlanInstanceSchema.index({ device: 1, active: 1 });

exports.model = mongoose.model('GrowPlanInstance', GrowPlanInstanceSchema);