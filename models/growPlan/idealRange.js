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


/************************** INSTANCE METHODS  ***************************/
/*
 * Given another IdealRange object, determine whether
 * they're equivalent.
 *
 * Synchronous, unlike parent "isEquivalentTo" functions
 * 
 * @param other. IdealRange model object
 * @return boolean. Function to be called with result. Passed a boolean argument,
 * 					true if the objects are equivalent, false if not
 *
 */
IdealRangeSchema.method('isEquivalentTo', function(other){
	var getObjectId = require('../utils').getObjectId;

	if (this.sCode !== other.sCode) { return false;}
	if (this.valueRange.min !== other.valueRange.min) { return false;}
	if (this.valueRange.max !== other.valueRange.max) { return false;}
	
	if (!((this.actionBelowMin && other.actionBelowMin) || (!this.actionBelowMin && !other.actionBelowMin))) {
		return false;
	}
	if (this.actionBelowMin){
		var thisActionBelowMinId = getObjectId(this.actionBelowMin),
			otherActionBelowMinId = getObjectId(other.actionBelowMin);
		if (!thisActionBelowMinId.equals(otherActionBelowMinId)) { return false;}
	}

	if (!((this.actionAboveMax && other.actionAboveMax) || (!this.actionAboveMax && !other.actionAboveMax))) {
		return false;
	}
	if (this.actionAboveMax){
		var thisActionAboveMaxId = getObjectId(this.actionAboveMax),
			otherActionAboveMaxId = getObjectId(other.actionAboveMax);
		if (!thisActionAboveMaxId.equals(otherActionAboveMaxId)) { return false;}
	}

	if (!((this.applicableTimeSpan && other.applicableTimeSpan) || (!this.applicableTimeSpan && !other.applicableTimeSpan))) {
		return false;
	}
	if (this.applicableTimeSpan){
		if (!
			(this.applicableTimeSpan.startTime == other.applicableTimeSpan.startTime)
			&&
			(this.applicableTimeSpan.endTime == other.applicableTimeSpan.endTime)
			){
			return false;
		}
	}

	return true;
});


IdealRangeSchema.method('checkIfWithinTimespan', function(timezone, date){
	var applicableTimeSpan = this.applicableTimeSpan;
	if (applicableTimeSpan){ return true; }
	
	var dateParts = timezone(dateParts, userTimezone, '%T').split(':'),
        millisecondsIntoDay = (dateParts[0] * 60 * 60 * 1000) + (dateParts[1] * 60 * 1000) + (dateParts[2] * 1000);

    return ( (millisecondsIntoDay >= applicableTimeSpan.startTime) && (millisecondsIntoDay <= applicableTimeSpan.endTime) );
});

/************************** END INSTANCE METHODS  ***************************/

exports.schema = IdealRangeSchema;