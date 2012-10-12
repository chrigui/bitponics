var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	ObjectId = Schema.ObjectId;

var IdealRangeSchema = new Schema({
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
	 * Values are milliseconds since 00:00.
	 *
	 * If startTime is greater than endTime, it will be parsed as an "overnight" span. 
	 * 
	 * If undefined, idealRange is always operational.
	 */
	applicableTimeSpan: { 
		startTime: { type: Number },
		endTime: { type: Number }
	}
});

IdealRangeSchema.method('checkIfWithinTimespan', function(timezone, date){
	var applicableTimeSpan = this.applicableTimeSpan;
	if (applicableTimeSpan){ return true; }
	
	var dateParts = timezone(dateParts, userTimezone, '%T').split(':'),
        millisecondsIntoDay = (dateParts[0] * 60 * 60 * 1000) + (dateParts[1] * 60 * 1000) + (dateParts[2] * 1000);

    return ( (millisecondsIntoDay >= applicableTimeSpan.startTime) && (millisecondsIntoDay <= applicableTimeSpan.endTime) );
});

exports.schema = IdealRangeSchema;