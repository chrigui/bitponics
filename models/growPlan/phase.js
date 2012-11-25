var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
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
	var phase = this;

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
		var thisGrowSystemId = phase.growSystem.constructor.name.toLowerCase() === 'objectid' ? phase.growSystem : phase.growSystem._id,
			otherGrowSystemId = other.growSystem.constructor.name.toLowerCase() === 'objectid' ? other.growSystem : other.growSystem._id;
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
	

	// TODO : all the async comparisons
	var allAsyncEquivalenceChecksPassed = true;
	async.parallel(
		[
			function lightComparison(innerCallback){
				if (!phase.light){ return innerCallback(null, true); }

				if (phase.light.fixture){
					var thisLightFixtureId = phase.light.fixture.constructor.name.toLowerCase() === 'objectid' ? phase.light.fixture : phase.light.fixture._id;
					var otherLightFixtureId = other.light.fixture.constructor.name.toLowerCase() === 'objectid' ? other.light.fixture : other.light.fixture._id;
					if (!thisLightFixtureId.equals(otherLightFixtureId)){
						return innerCallback(null, false);
					}
				}
				if (phase.light.fixtureQuantity !== other.light.fixtureQuantity){
					return innerCallback(null, false);
				}
				if (phase.light.bulb){
					var thisLightBulbId = phase.light.bulb.constructor.name.toLowerCase() === 'objectid' ? phase.light.bulb : phase.light.bulb._id;
					var otherLightBulbId = other.light.bulb.constructor.name.toLowerCase() === 'objectid' ? other.light.bulb : other.light.bulb._id;
					if (!thisLightBulbId.equals(otherLightBulbId)){
						return innerCallback(null, false);
					}
				}
				return innerCallback(null, true);
			},
			function actionsComparison(innerCallback){
				if (!phase.actions || !phase.actions.length) { return callback(null, true); }

				var allActionsFound = true;
				for (var i = 0, length = phase.actions.length; i < length; i++){
					// TODO : figure out how to handle actions that haven't been "populated" (they're still just an ObjectID)
					var thisActionId = (phase.actions[i].constructor.name.toLowerCase() === 'objectid' ? phase.actions[i] : phase.actions[i]._id),
						actionFound = false;
					for (var j = 0; j < length; j++){
						var otherActionId =  (other.actions[j].constructor.name.toLowerCase() === 'objectid' ? other.actions[j] : other.actions[j]._id);
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
					return callback(null, false);
				}
				return callback(null, true);
			},
			function phaseEndActionsComparison(innerCallback){
				if (!phase.phaseEndActions || !phase.phaseEndActions.length) { return callback(null, true); }

				var allActionsFound = true;
				for (var i = 0, length = phase.phaseEndActions.length; i < length; i++){
					// TODO : figure out how to handle actions that haven't been "populated" (they're still just an ObjectID)
					var actionId = (phase.phaseEndActions[i].constructor.name.toLowerCase() === 'objectid' ? phase.phaseEndActions[i] : phase.phaseEndActions[i]._id),
						actionFound = false;
					for (var j = 0; j < length; j++){
						var otherActionId = (other.phaseEndActions[j].constructor.name.toLowerCase() === 'objectid' ? other.phaseEndActions[j] : other.phaseEndActions[j]._id);
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
					return callback(null, false);
				}
				return callback(null, true);	
			},
			function idealRangesComparison(innerCallback){
				if (!phase.idealRanges || !phase.idealRanges.length) { return callback(null, true); }

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
					return callback(null, false);
				}
				return callback(null, true);
			},
			function nutrientsComparison(innerCallback){
				if (!phase.nutrients || !phase.nutrients.length) { return callback(null, true); }

				var allNutrientsFound = true;
				for (var i = 0, length = phase.nutrients.length; i < length; i++){
					// TODO : figure out how to handle those that haven't been "populated" (they're still just an ObjectID)
					var nutrientId = (phase.nutrients[i].constructor.name.toLowerCase() === 'objectid' ? phase.nutrients[i] : phase.nutrients[i]._id),
						nutrientFound = false;
					for (var j = 0; j < length; j++){
						var otherNutrientId = (other.nutrients[j].constructor.name.toLowerCase() === 'objectid' ? other.nutrients[j] : other.nutrients[j]._id);
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
					return callback(null, false);
				}
				return callback(null, true);	
			}
		],
		function parallelComparisonEnd(err, results){
			for (var i = 0, length = results.length; i < length; i++){
				if (results[i] === false){ 
					allAsyncEquivalenceChecksPassed = false; 
					break;
				}
			}
			return callback(err, allAsyncEquivalenceChecksPassed);
		}
	);
});

exports.schema = PhaseSchema;