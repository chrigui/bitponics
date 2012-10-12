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
	
	idealRanges: [IdealRangeSchema],

	nutrients : [{ type: ObjectId, ref: 'Nutrient', required: false }],
});

exports.schema = PhaseSchema;