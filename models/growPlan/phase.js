var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	ObjectId = Schema.ObjectId,
  	IdealRangeSchema = require('./idealRange').schema;

var PhaseSchema = new Schema({
	
	name: { type: String, required: true },
	
	description: { type: String },

	/**
	 * expectedNumberOfDays. undefined means infinite.
	 */
	expectedNumberOfDays: { type: Number, required: false },
	
	/**
	 * Light definition. Optional. Defines fixtures, bulbs, and quantities.
	 */
	light: {
		fixture: { type: ObjectId, ref: 'LightFixture'},
		fixtureQuantity: { type : Number },
		bulb: { type : ObjectId, ref: 'LightBulb'}
	},

	growSystem: { type: ObjectId, ref: 'GrowSystem' },
	
	growMedium: { type: String },

	actions: [{ type: ObjectId, ref: 'Action', required: true }],
	
	phaseEndActions : [{ type: ObjectId, ref: 'Action', required: true }],

	phaseEndDescription : { type : String },

	idealRanges: [IdealRangeSchema],

	nutrients : [{ type: ObjectId, ref: 'Nutrient', required: false }],
});


/************************** INSTANCE METHODS  ***************************/
/*
 * Given another Phase object, determine whether
 * they're equivalent..
 * Comparing only salient properties; ignoring properties 
 * like createdAt/updatedAt
 * 
 * @param other. Phase model object
 * @param callback. Function to be called with result. Passed a boolean argument,
 * 					true if the objects are equivalent, false if not
 *
 */
PhaseSchema.method('isEquivalentTo', function(other, callback){
	var phase = this;

	// compare name
	if (this.name !== other.name) { return callback(null, false); }

	// compare description
	if (this.description !== other.description) { return callback(null, false); }

	// compare expectedNumberOfDays
	if (this.expectedNumberOfDays !== other.expectedNumberOfDays) { return callback(null, false); }

	// compare growMedium
	if (this.growMedium !== other.growMedium) { return callback(null, false); }	

	// compare phaseEndDescription
	if (this.phaseEndDescription !== other.phaseEndDescription) { return callback(null, false); }		


	// compare light, shallow
	if ( !(
			(this.light.fixture && other.light.fixture) ||
			(!this.light.fixture && !other.light.fixture)
		 )
		){ 
		return callback(null, false); 
	}

	// compare actions, shallow
	if ( !(
			(this.actions && other.actions) ||
			(!this.actions && !other.actions)
		 )
		){ 
		return callback(null, false); 
	}
	if (this.actions && other.actions && (this.actions.length !== other.actions.length)){
		return callback(null, false);
	}

	// compare idealRanges, shallow
	if ( !(
			(this.idealRanges && other.idealRanges) ||
			(!this.idealRanges && !other.idealRanges)
		 )
		){ 
		return callback(null, false); 
	}
	if (this.idealRanges && other.idealRanges && (this.idealRanges.length !== other.idealRanges.length)){
		return callback(null, false);
	}
	

	// compare nutrients, shallow
	if ( !(
			(this.nutrients && other.nutrients) ||
			(!this.nutrients && !other.nutrients)
		 )
		){ 
		return callback(null, false); 
	}
	if (this.nutrients && other.nutrients && (this.nutrients.length !== other.nutrients.length)){
		return callback(null, false);
	}
	

	// TODO : all the async comparisons

	return callback(null, true);
});

exports.schema = PhaseSchema;