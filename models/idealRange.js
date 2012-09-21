var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	mongoosePlugins = require('../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
  	ObjectId = Schema.ObjectId;

var IdealRangeSchema = new Schema({
	name: { type: String },

	/**
	 * sCode references Sensor.code
	 */
	sCode: { type: String, ref: 'Sensor', required: true },
		
	valueRange: {
		min: { type: Number, required: true },
		max: { type: Number, required: true }
	},

	actionBelowMin: { type: ObjectId, ref: 'Action', required: true },

	actionAboveMax: { type: ObjectId, ref: 'Action', required: true },

	/**
	 * applicableTimeSpan. optional. Describes the portion of a 24-hour day
	 * during which this idealRange is operational.  
	 *
	 * values are milliseconds since * 00:00
	 *
	 * If undefined, idealRange is always operational
	 */
	applicableTimeSpan: { 
		startTime: { type: Number },
		endTime: { type: Number }
	}
});

IdealRangeSchema.plugin(useTimestamps);

exports.schema = IdealRangeSchema;
exports.model = mongoose.model('IdealRange', IdealRangeSchema);