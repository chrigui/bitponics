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
	controls: [{
		outletId: { type: Number, required: true }, //associated with Bitponics device outlet id)
		control: { type: ObjectId, ref: 'Control', required: true }
	}],
	start date: { type: Number, required: true },
	phases: [{
		phase: { type: ObjectId, ref: 'Phase' },
		startDate: { type: Number, required: true },
		endDate: { type: Number, required: true },
		active: { type: Boolean }
	}],
	sensorLogs: [{
		sensor: { type: ObjectId, ref: 'Sensor', required: true },
		value: { type: Number },
		timestamp: { type: Number, required: true }
	}],
	controlLogs: [{
		control: { type: ObjectId, ref: 'Control' },
		value: { type: Number },
		timestamp: { type: Number, required: true }
	}],
	photoLogs: [{
		s3url: { type : mongoose.SchemaTypes.Url, required: true},
		tags: { type : [String]},
		timestamp: { type: Number, required: true }
	}],
	genericLogs: [{
		entry: { type: String, required: true },
		tags: { type : [String]},
		logType: { type: String },
		timestamp: { type: Number, required: true }
	}]


	// photos : {
	// 	url : { type : mongoose.SchemaTypes.Url, required: true},
	// 	createdAt : { type : Date, default: Date.now},
	// 	tags: { type : [String]}
	// }
},
{ strict: true });

GrowPlanInstanceSchema.plugin(useTimestamps); // adds createdAt/updatedAt fields to the schema, and adds the necessary middleware to populate those fields 

exports.model = mongoose.model('GrowPlanInstance', GrowPlanInstanceSchema);