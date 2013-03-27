var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	ActionModel = require('../action').model,
	getObjectId = require('../utils').getObjectId,
  async = require('async');

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
},
{ id : false });


/************************** INSTANCE METHODS  ***************************/

IdealRangeSchema.method('checkIfWithinTimespan', function(userTimezone, date){
	var tz = require('timezone/loaded'),
    applicableTimeSpan = this.applicableTimeSpan;
	
  if (!applicableTimeSpan){ return true; }
	
	var dateParts = tz(date, userTimezone, '%T').split(':'),
      millisecondsIntoDay = (dateParts[0] * 60 * 60 * 1000) + (dateParts[1] * 60 * 1000) + (dateParts[2] * 1000);

    return ( (millisecondsIntoDay >= applicableTimeSpan.startTime) && (millisecondsIntoDay <= applicableTimeSpan.endTime) );
});

/************************** END INSTANCE METHODS  ***************************/


/************************** STATIC METHODS  ***************************/

/**
 * Given two IdealRange objects, determine whether they're equivalent
 * by comparing user-defined properties.
 *
 * Synchronous, unlike parent "isEquivalentTo" functions.
 *
 * Assumes that if actionBelowMin and actionAboveMax are defined,
 * they are populated Action model objects and not simply ObjectIds or strings.
 * 
 * @param source {IdealRange}. IdealRange model object. 
 * @param other {IdealRange}. IdealRange model object. 
 * @return {boolean}. true if the objects are equivalent, false if not
 */
IdealRangeSchema.static('isEquivalentTo', function(source, other){
	if (source.sCode !== other.sCode) { return false;}
	if (source.valueRange.min !== other.valueRange.min) { return false;}
	if (source.valueRange.max !== other.valueRange.max) { return false;}
	
	if (!((source.actionBelowMin && other.actionBelowMin) || (!source.actionBelowMin && !other.actionBelowMin))) {
		return false;
	}
	if (source.actionBelowMin){
		if (!ActionModel.isEquivalentTo(source.actionBelowMin, other.actionBelowMin)) { return false;}
	}

	if (!((source.actionAboveMax && other.actionAboveMax) || (!source.actionAboveMax && !other.actionAboveMax))) {
		return false;
	}
	if (source.actionAboveMax){
		if (!ActionModel.isEquivalentTo(source.actionAboveMax, other.actionAboveMax)) { return false;}
	}

	if (!((source.applicableTimeSpan && other.applicableTimeSpan) || (!source.applicableTimeSpan && !other.applicableTimeSpan))) {
		return false;
	}
	if (source.applicableTimeSpan){
		if (!
			(source.applicableTimeSpan.startTime == other.applicableTimeSpan.startTime)
			&&
			(source.applicableTimeSpan.endTime == other.applicableTimeSpan.endTime)
			){
			return false;
		}
	}

	return true;
});


/**
 * Takes a fully-populated IdealRange object (such as is submitted from grow-plans creation page)
 * and, for all nested documents (actionBelowMin, actionAboveMax), creates them if they don't match existing DB entries
 * Then returns IdealRange object
 * 
 * @param {object} options.idealRange
 * @param {User} options.user : used to set "createdBy" field for new objects
 * @param {VISIBILITY_OPTION} options.visibility : used to set "visibility" field for new objects. value from fe-be-utils.VISIBILITY_OPTIONS
 * @param {function(err, IdealRange)} callback
 */
IdealRangeSchema.static('createNewIfUserDefinedPropertiesModified', function(options, callback){
  var submittedIdealRange = options.idealRange,
    user = options.user,
    visibility = options.visibility;

  async.parallel(
    [
      function validateActionBelowMin(innerCallback){
        if (!submittedIdealRange.actionBelowMin) { return innerCallback(); }
        
        ActionModel.createNewIfUserDefinedPropertiesModified({
          action : submittedIdealRange.actionBelowMin,
          user : user,
          visibility : visibility
        },
        function(err, validatedAction){
          if (err) { return innerCallback(err); }
          submittedIdealRange.actionBelowMin = validatedAction._id;
          return innerCallback();
        });
      },
      function validateActionAboveMax(innerCallback){
        if (!submittedIdealRange.actionAboveMax) { return innerCallback(); }
        
        ActionModel.createNewIfUserDefinedPropertiesModified({
          action : submittedIdealRange.actionAboveMax,
          user : user,
          visibility : visibility
        },
        function(err, validatedAction){
          if (err) { return innerCallback(err); }
          submittedIdealRange.actionAboveMax = validatedAction._id;
          return innerCallback();
        });
      },
    ],
    function parallelEnd(err, results){
      // force mongoose to create a new _id
      delete submittedIdealRange._id;
      return callback(err, submittedIdealRange);
    }
  );
});
/************************** END STATIC METHODS  ***************************/

exports.schema = IdealRangeSchema;