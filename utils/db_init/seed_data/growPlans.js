module.exports = [
		{
			//parentGrowPlanId: { type: ObjectId, ref: 'GrowPlan' },
			createdByUserId: "savedObjectIds['users']['jack@bitponics.com']",
			name: "Tomato",
			description: "Growing indeterminate organic tomatoes (Redfield Beauty OG) for year round fruiting. Growing in a 3’x3’ grow bed filled with 4\" of hydroton.",
			plants: ["tomatoes"],
			expertiseLevel: "intermediate",
			growSystem: "savedObjectIds['growSystems']['Drip']",
			growMedium: "hydroton",
			nutrients: [
				"savedObjectIds['nutrients']['Grow']",
				"savedObjectIds['nutrients']['Bloom']",
				"savedObjectIds['nutrients']['Micro']"
			],
			sensors: [
				"savedObjectIds['sensors']['ph']",
				"savedObjectIds['sensors']['air']",
				"savedObjectIds['sensors']['water']",
				"savedObjectIds['sensors']['ec']",
				"savedObjectIds['sensors']['hum']"
			],
			controls: [
				"savedObjectIds['controls']['Light']"
			],
			phases: [
				"savedObjectIds['phases']['Vegetative']",
				"savedObjectIds['phases']['Blooming']",
				"savedObjectIds['phases']['Fruiting']"
			]
		},
		{
			//parentGrowPlanId: { type: ObjectId, ref: 'GrowPlan' },
			createdByUserId: "savedObjectIds['users']['jack@bitponics.com']",
			name: "Mixed Greens",
			description: "A grow plan suited for growing any variety of herbs and leafy greens you want. Basil, cilantro, lettuce, swiss chard, throw it all in!",
			plants: ["basil", "swiss chard", "cilantro", "lettuce"],
			expertiseLevel: "intermediate",
			growSystem: "savedObjectIds['growSystems']['Drip']",
			growMedium: "hydroton",
			nutrients: [
				"savedObjectIds['nutrients']['Grow']",
				"savedObjectIds['nutrients']['Bloom']",
				"savedObjectIds['nutrients']['Micro']"
			],
			sensors: [
				"savedObjectIds['sensors']['ph']",
				"savedObjectIds['sensors']['air']",
				"savedObjectIds['sensors']['water']",
				"savedObjectIds['sensors']['ec']",
				"savedObjectIds['sensors']['hum']"
			],
			controls: [
				"savedObjectIds['controls']['Light']"
			],
			phases: [
				"savedObjectIds['phases']['Vegetative']",
				"savedObjectIds['phases']['Blooming']",
				"savedObjectIds['phases']['Fruiting']"
			]
		}
	];