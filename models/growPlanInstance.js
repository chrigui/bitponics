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
		sensor: { type: ObjectId, ref: 'Sensor', required: true },
		value: { type: Number },
		//timestamp: { type: Date, required: true }
		timestamp: { type: Date, required: true, default: Date.now }
	}],
	
	controlLogs: [{
		control: { type: ObjectId, ref: 'Control', required: true },
		value: { type: Number },
		timestamp: { type: Date, required: true, default: Date.now }
	}],
	
	photoLogs: [{
		url: { type : mongoose.SchemaTypes.Url, required: true},
		tags: { type : [String]},
		timestamp: { type: Date, required: true, default: Date.now }
	}],
	
	genericLogs: [{
		entry: { type: String, required: true },
		tags: { type : [String]},
		logType: { type: String },
		timestamp: { type: Date, required: true, default: Date.now }
	}]

},
{ strict: true });

GrowPlanInstanceSchema.plugin(useTimestamps); // adds createdAt/updatedAt fields to the schema, and adds the necessary middleware to populate those fields 

exports.model = mongoose.model('GrowPlanInstance', GrowPlanInstanceSchema);