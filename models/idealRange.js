var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var IdealRangeSchema = new Schema({
	sensor: { type: ObjectId, ref: 'Sensor', required: true },
		
	min: { type: Number, required: true },
	
	max: { type: Number, required: true },
	
	actionBelowMin: { type: ObjectId, ref: 'Action', required: true },

	actionAboveMax: { type: ObjectId, ref: 'Action', required: true },

	/**
	 * applicableTimeSpan. optional. values are milliseconds since * 00:00
	 */
	applicableTimeSpan: { 
		startTime: { type: Number },
		endTime: { type: Number }
	}
});

IdealRangeSchema.plugin(useTimestamps);

exports.schema = IdealRangeSchema;
exports.model = mongoose.model('IdealRange', IdealRangeSchema);