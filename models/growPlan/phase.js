var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	mongoosePlugins = require('../../lib/mongoose-plugins'),
  	Schema = mongoose.Schema,
  	ObjectId = Schema.ObjectId,
  	IdealRangeSchema = require('./idealRange').schema,
  	async = require('async'),
  	Action = require('../action').model,
  	getObjectId = require('../utils').getObjectId;

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
},
{ id : false });

/************************** INSTANCE METHODS  ***************************/


// TODO : Add validation on save. 
// Validation rules:
// Max 1 idealRange per sensor. 

/*********************** END INSTANCE METHODS *************************/



/*********************** STATIC METHODS ******************************/

/**
 * Given 2 Phase objects, determine whether they're equivalent.
 * Comparing only user-defined properties.
 * 
 * @param source {Phase} Phase model object
 * @param other {Phase} Phase model object
 * @param callback. Function to be called with result. Passed a boolean argument,
 * 					true if the objects are equivalent, false if not
 *
 */
PhaseSchema.static('isEquivalentTo', function(source, other, callback){
	// compare name
	if (source.name !== other.name) { return callback(null, false); }

	// compare description
	if (source.description !== other.description) { return callback(null, false); }

	// compare expectedNumberOfDays
	if (source.expectedNumberOfDays !== other.expectedNumberOfDays) { return callback(null, false); }

	// compare growMedium
	if (source.growMedium !== other.growMedium) { return callback(null, false); }	


	// compare growSystem
	if ( !(
			(source.growSystem && other.growSystem)
			||
			(!source.growSystem && !other.growSystem)
		  )
		)
	{ 
		return callback(null, false); 
	}
	if (source.growSystem){
		var thisGrowSystemId = getObjectId(source.growSystem),
			otherGrowSystemId = getObjectId(other.growSystem);
		if (!thisGrowSystemId.equals(otherGrowSystemId)){
			return callback(null, false);
		}
	}

	// compare phaseEndDescription
	if (source.phaseEndDescription !== other.phaseEndDescription) { return callback(null, false); }		


	// compare light, shallow
	if (!(
		(source.light && other.light)
		||
		(!source.light && !other.light)
		)){ 
		return callback(null, false); 
	}
	if (source.light){
		if ( !(
			(source.light.fixture && other.light.fixture) ||
			(!source.light.fixture && !other.light.fixture)
		 )
		){ 
			return callback(null, false); 
		}
		if ( !(
			(source.light.bulb && other.light.bulb) ||
			(!source.light.bulb && !other.light.bulb)
		 )
		){ 
			return callback(null, false); 
		}
		if ( source.light.fixtureQuantity !== other.light.fixtureQuantity)
		{ 
			return callback(null, false); 
		}
	}
	

	// compare actions, shallow
	if ( !(
			(source.actions && other.actions) ||
			(!source.actions && !other.actions)
		 )
		){ 
		return callback(null, false); 
	}
	if (source.actions && other.actions && (source.actions.length !== other.actions.length)){
		return callback(null, false);
	}

	// compare phaseEndActions, shallow
	if ( !(
			(source.phaseEndActions && other.phaseEndActions) ||
			(!source.phaseEndActions && !other.phaseEndActions)
		 )
		){ 
		return callback(null, false); 
	}
	if (source.phaseEndActions && other.phaseEndActions && (source.phaseEndActions.length !== other.phaseEndActions.length)){
		return callback(null, false);
	}


	// compare idealRanges, shallow
	if ( !(
			(source.idealRanges && other.idealRanges) ||
			(!source.idealRanges && !other.idealRanges)
		 )
		){ 
		return callback(null, false); 
	}
	if (source.idealRanges && other.idealRanges && (source.idealRanges.length !== other.idealRanges.length)){
		return callback(null, false);
	}
	

	// compare nutrients, shallow
	if ( !(
			(source.nutrients && other.nutrients) ||
			(!source.nutrients && !other.nutrients)
		 )
		){ 
		return callback(null, false); 
	}
	if (source.nutrients && other.nutrients && (source.nutrients.length !== other.nutrients.length)){
		return callback(null, false);
	}
	

	async.parallel(
		[
			function lightComparison(innerCallback){
				if (!source.light){ return innerCallback(null, true); }

				if (source.light.fixture){
					var sourceLightFixtureId = getObjectId(source.light.fixture),
						otherLightFixtureId = getObjectId(other.light.fixture);
					if (!sourceLightFixtureId.equals(otherLightFixtureId)){
						return innerCallback(null, false);
					}
				}
				if (source.light.fixtureQuantity !== other.light.fixtureQuantity){
					return innerCallback(null, false);
				}
				if (source.light.bulb){
					var sourceLightBulbId = getObjectId(source.light.bulb),
						otherLightBulbId = getObjectId(other.light.bulb);
					if (!sourceLightBulbId.equals(otherLightBulbId)){
						return innerCallback(null, false);
					}
				}
				return innerCallback(null, true);
			},
			function actionsComparison(innerCallback){
				if (!source.actions || !source.actions.length) { return innerCallback(null, true); }

				var allActionsFound = true;
				for (var i = 0, length = source.actions.length; i < length; i++){
					var action = source.actions[i],
						actionFound = false;
					for (var j = 0; j < length; j++){
						var otherAction = other.actions[j];
						if (Action.isEquivalentTo(action, otherAction)) {
							actionFound = true;
							break;
						}
					}
					if (!actionFound) { 
						allActionsFound = false;
						break;
					}
				}
				if (!allActionsFound){
					return innerCallback(null, false);
				}
				return innerCallback(null, true);
			},
			function phaseEndActionsComparison(innerCallback){
				if (!source.phaseEndActions || !source.phaseEndActions.length) { return innerCallback(null, true); }

				var allActionsFound = true;
				for (var i = 0, length = source.phaseEndActions.length; i < length; i++){
					var action = source.phaseEndActions[i],
						actionFound = false;
					for (var j = 0; j < length; j++){
						var otherAction = other.phaseEndActions[j];
						if (Action.isEquivalentTo(action, otherAction)){
							actionFound = true;
							break;
						}
					}
					if (!actionFound) { 
						allActionsFound = false;
						break;
					}
				}
				if (!allActionsFound){
					return innerCallback(null, false);
				}
				return innerCallback(null, true);	
			},
			function idealRangesComparison(innerCallback){
				if (!source.idealRanges || !source.idealRanges.length) { return innerCallback(null, true); }

				var allIdealRangesFound = true;
				for (var i = 0, length = source.idealRanges.length; i < length; i++){
					var idealRangeFound = false;
					for (var j = 0; j < length; j++){
						if (IdealRangeSchema.statics.isEquivalentTo(source.idealRanges[i], other.idealRanges[j])){
							idealRangeFound = true;
							break;
						}
					}
					if (!idealRangeFound) { 
						allIdealRangesFound = false;
						break;
					}
				}
				if (!allIdealRangesFound){
					return innerCallback(null, false);
				}
				return innerCallback(null, true);
			},
			function nutrientsComparison(innerCallback){
				if (!source.nutrients || !source.nutrients.length) { return innerCallback(null, true); }

				var allNutrientsFound = true;
				for (var i = 0, length = source.nutrients.length; i < length; i++){
					var nutrientId = getObjectId(source.nutrients[i]),
						nutrientFound = false;
					for (var j = 0; j < length; j++){
						var otherNutrientId = getObjectId(other.nutrients[j]);
						if (nutrientId.equals(otherNutrientId)){
							nutrientFound = true;
							break;
						}
					}
					if (!nutrientFound) { 
						allNutrientsFound = false;
						break;
					}
				}
				if (!allNutrientsFound){
					return innerCallback(null, false);
				}
				return innerCallback(null, true);	
			}
		],
		function parallelComparisonEnd(err, results){
			var allAsyncEquivalenceChecksPassed = results.every(function(result){ return result; });
			return callback(err, allAsyncEquivalenceChecksPassed);
		}
	);
});

/*********************** END STATIC METHODS **************************/

exports.schema = PhaseSchema;