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

	sensorLogs: [{
		timestamp: { type: Date, required: true, default: Date.now },
		logs : [{
			/**
			 * sCode references to Sensor.code
			 */
			sCode: { type: String, ref: 'Sensor', required: true },
			value: { type: Number }
		}]
	}],
	
	/*
	controlLogs: [{
		timestamp: { type: Date, required: true, default: Date.now },
		logs : [{
			control: { type: ObjectId, ref: 'Control', required: true },
			value: { type: Number }
		}]
	}],
	*/


	actionLogs: [{
		/**
		 * The time that this action was first requested, either through a sensor trigger or a manual trigger
		 */
		timeRequested: { type: Date, required: true, default: Date.now },
		
		/**
		 * The time this action was actually sent, either to the device or user
		 */
		timeSent: { type: Date },
		
		/**
		 * Reference to the action
		 */
		action : {type: ObjectId, ref: 'Action', required: true},
		
		/**
		 * Boolean indicating whether this action has been sent. This will be
		 * what queries are run against in order to pick up pending actions.
		 * Might be redundant given timeSent...could just check that for null
		 */
		sent: {type: Boolean, default : false},
		
		/**
		 * "Done" status of the action. Device actions are automatically marked as done.
		 * Actions that require user action might require the user to mark it as done...but
		 * that's not implemented. For now we'll just mark this as true whenever an action is _sent_.
		 */
		done: {type : Boolean, default : false}
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
GrowPlanInstanceSchema.index({ 'sensorLogs.logs.timestamp sensorLogs.logs.sCode': -	1 });



exports.model = mongoose.model('GrowPlanInstance', GrowPlanInstanceSchema);