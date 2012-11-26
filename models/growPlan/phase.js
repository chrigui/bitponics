var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	mongoosePlugins = require('../../lib/mongoose-plugins'),
  	Schema = mongoose.Schema,
  	ObjectId = Schema.ObjectId,
  	IdealRangeSchema = require('./idealRange').schema,
  	async = require('async');

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
 * they're equivalent.
 * Comparing only salient properties; ignoring properties 
 * like createdAt/updatedAt
 * 
 * @param other. Phase model object
 * @param callback. Function to be called with result. Passed a boolean argument,
 * 					true if the objects are equivalent, false if not
 *
 */
PhaseSchema.method('isEquivalentTo', function(other, callback){
	var phase = this,
		getObjectId = require('../utils').getObjectId;

	// compare name
	if (this.name !== other.name) { return callback(null, false); }

	// compare description
	if (this.description !== other.description) { return callback(null, false); }

	// compare expectedNumberOfDays
	if (this.expectedNumberOfDays !== other.expectedNumberOfDays) { return callback(null, false); }

	// compare growMedium
	if (this.growMedium !== other.growMedium) { return callback(null, false); }	


	// compare growSystem
	if ( !(
			(this.growSystem && other.growSystem)
			||
			(!this.growSystem && !other.growSystem)
		  )
		)
	{ 
		return callback(null, false); 
	}
	if (this.growSystem){
		var thisGrowSystemId = getObjectId(phase.growSystem),
			otherGrowSystemId = getObjectId(other.growSystem);
		if (!thisGrowSystemId.equals(otherGrowSystemId)){
			return callback(null, false);
		}
	} 

	// compare phaseEndDescription
	if (this.phaseEndDescription !== other.phaseEndDescription) { return callback(null, false); }		


	// compare light, shallow
	if (!(
		(this.light && other.light)
		||
		(!this.light && !other.light)
		)){ 
		return callback(null, false); 
	}
	if (this.light){
		if ( !(
			(this.light.fixture && other.light.fixture) ||
			(!this.light.fixture && !other.light.fixture)
		 )
		){ 
			return callback(null, false); 
		}
		if ( !(
			(this.light.bulb && other.light.bulb) ||
			(!this.light.bulb && !other.light.bulb)
		 )
		){ 
			return callback(null, false); 
		}
		if ( this.light.fixtureQuantity !== other.light.fixtureQuantity)
		{ 
			return callback(null, false); 
		}
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

	// compare phaseEndActions, shallow
	if ( !(
			(this.phaseEndActions && other.phaseEndActions) ||
			(!this.phaseEndActions && !other.phaseEndActions)
		 )
		){ 
		return callback(null, false); 
	}
	if (this.phaseEndActions && other.phaseEndActions && (this.phaseEndActions.length !== other.phaseEndActions.length)){
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
	

	async.parallel(
		[
			function lightComparison(innerCallback){
				if (!phase.light){ return innerCallback(null, true); }

				if (phase.light.fixture){
					var thisLightFixtureId = getObjectId(phase.light.fixture),
						otherLightFixtureId = getObjectId(other.light.fixture);
					if (!thisLightFixtureId.equals(otherLightFixtureId)){
						return innerCallback(null, false);
					}
				}
				if (phase.light.fixtureQuantity !== other.light.fixtureQuantity){
					return innerCallback(null, false);
				}
				if (phase.light.bulb){
					var thisLightBulbId = getObjectId(phase.light.bulb),
						otherLightBulbId = getObjectId(other.light.bulb);
					if (!thisLightBulbId.equals(otherLightBulbId)){
						return innerCallback(null, false);
					}
				}
				return innerCallback(null, true);
			},
			function actionsComparison(innerCallback){
				if (!phase.actions || !phase.actions.length) { return innerCallback(null, true); }

				var allActionsFound = true;
				for (var i = 0, length = phase.actions.length; i < length; i++){
					var thisActionId = getObjectId(phase.actions[i]),
						actionFound = false;
					for (var j = 0; j < length; j++){
						var otherActionId =  getObjectId(other.actions[j]);
						if (thisActionId.equals(otherActionId)){
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
				if (!phase.phaseEndActions || !phase.phaseEndActions.length) { return innerCallback(null, true); }

				var allActionsFound = true;
				for (var i = 0, length = phase.phaseEndActions.length; i < length; i++){
					var actionId = getObjectId(phase.phaseEndActions[i]),
						actionFound = false;
					for (var j = 0; j < length; j++){
						var otherActionId = getObjectId(other.phaseEndActions[j]);
						if (actionId.equals(otherActionId)){
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
				if (!phase.idealRanges || !phase.idealRanges.length) { return innerCallback(null, true); }

				var allIdealRangesFound = true;
				for (var i = 0, length = phase.idealRanges.length; i < length; i++){
					var idealRangeFound = false;
					for (var j = 0; j < length; j++){
						if (phase.idealRanges[i].isEquivalentTo(other.idealRanges[j])){
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
				if (!phase.nutrients || !phase.nutrients.length) { return innerCallback(null, true); }

				var allNutrientsFound = true;
				for (var i = 0, length = phase.nutrients.length; i < length; i++){
					var nutrientId = getObjectId(phase.nutrients[i]),
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

exports.schema = PhaseSchema;