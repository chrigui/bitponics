var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	useTimestamps = mongooseTypes.useTimestamps,
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	GrowPlan = require('./growPlan').model,
	User = requre('./user').model;

/**
 * GrowPlanInstance 
 */
var GrowPlanInstanceSchema = new Schema({

	users : [{ type: ObjectId, ref: 'User'}],
	
	growPlan : { type : ObjectId, ref : 'GrowPlan', required: true},
	
	device : { type : ObjectId, ref : 'Device', required: false },
	
	startDate: { type: Date, required: true },

	phases: [{
		phase: { type: ObjectId, ref: 'Phase' },
		startDate: { type: Date },
		endDate: { type: Date },
		active: { type: Boolean }
	}],

	sensorLogs: [{
		sensor: { type: ObjectId, ref: 'Sensor', required: true },
		value: { type: Number },
		timestamp: { type: Date, required: true }
	}],
	
	controlLogs: [{
		control: { type: ObjectId, ref: 'Control', , required: true },
		value: { type: Number },
		timestamp: { type: Date, required: true }
	}],
	
	photoLogs: [{
		url: { type : mongoose.SchemaTypes.Url, required: true},
		tags: { type : [String]},
		timestamp: { type: Date, required: true }
	}],
	
	genericLogs: [{
		entry: { type: String, required: true },
		tags: { type : [String]},
		logType: { type: String },
		timestamp: { type: Date, required: true }
	}]

},
{ strict: true });

GrowPlanInstanceSchema.plugin(useTimestamps); // adds createdAt/updatedAt fields to the schema, and adds the necessary middleware to populate those fields 

exports.model = mongoose.model('GrowPlanInstance', GrowPlanInstanceSchema);