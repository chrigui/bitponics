module.exports = [
		{
			name : 'Seedling',
			description: 'Seedling phase, from planting seeds until first true leaves appear.',
			expectedNumberOfDays: 10,
			light: {
				fixture: "savedObjectIds['lightFixtures']['cfl fixture']",
				fixtureQuantity : 1,
				bulb : "savedObjectIds['lightBulbs']['cfl']"
			},
			growSystem: "savedObjectIds['growSystems']['Egg-carton seed starter']",
			growMedium: "rockwool",
			nutrients: [],
			actions: [
				"savedObjectIds['actions']['Transplant seedlings into the grow bed']",
				"savedObjectIds['actions']['Flush and refill reservoir. Discard any solution in the reservoir, rinse the entire system with water. Then refill the reservoir to capacity with water. Mix in ¼ cup Grow nutrient, then ¼ cup Bloom nutrient, then ¼ cup Micro nutrient.']",
				"savedObjectIds['actions']['Water pump cycle']",
				"savedObjectIds['actions']['Light cycle, with lights on between 6am and 10pm.']"
			],
			idealRanges: [
				"savedObjectIds['idealRanges']['Ideal Light - Vegetative']",
				"savedObjectIds['idealRanges']['Ideal Air Temp']"
			]
		},
		{
			name : 'Vegetative',
			description: 'Open-ended vegetative phase. Bring in any existing plants or seedlings with their first pair of true leaves.',
			expectedNumberOfDays: 28,
			light: {
				fixture: "savedObjectIds['lightFixtures']['metal halide']",
				fixtureQuantity: 1,
				bulb: "savedObjectIds['lightBulbs']['metal halide']",
			},
			growSystem: "savedObjectIds['growSystems']['Drip']",
			growMedium: "hydroton",
			nutrients: [
				"savedObjectIds['nutrients']['Grow']",
				"savedObjectIds['nutrients']['Bloom']",
				"savedObjectIds['nutrients']['Micro']"
			],
			actions: [
				"savedObjectIds['actions']['Transplant seedlings into the grow bed']",
				"savedObjectIds['actions']['Flush and refill reservoir. Discard any solution in the reservoir, rinse the entire system with water. Then refill the reservoir to capacity with water. Mix in ¼ cup Grow nutrient, then ¼ cup Bloom nutrient, then ¼ cup Micro nutrient.']",
				"savedObjectIds['actions']['Water pump cycle']",
				"savedObjectIds['actions']['Light cycle, with lights on between 6am and 10pm.']"
			],
			idealRanges: [
				"savedObjectIds['idealRanges']['Ideal Light - Vegetative']",
				"savedObjectIds['idealRanges']['Ideal Air Temp']"
			]
		},
		{
			name : "Blooming",
			description: "Open-ended blooming phase. After about 7 days, you should begin to see blossoms.",
			expectedNumberOfDays: 7,
			light: {
				fixture: "savedObjectIds['lightFixtures']['metal halide']",
				fixtureQuantity: 1,
				bulb: "savedObjectIds['lightBulbs']['metal halide']",
			},
			growSystem: "savedObjectIds['growSystems']['Drip']",
			growMedium: "hydroton",
			nutrients: [
				"savedObjectIds['nutrients']['Grow']",
				"savedObjectIds['nutrients']['Bloom']",
				"savedObjectIds['nutrients']['Micro']"
			],
			actions: [
				"savedObjectIds['actions']['Pollinate any new blossoms using a watercolor brush to distribute']",
				"savedObjectIds['actions']['Flush and refill reservoir. Discard any solution in the reservoir, rinse the entire system with water. Then refill the reservoir to capacity with water. Mix in ¼ cup Grow nutrient, then ¼ cup Bloom nutrient, then ¼ cup Micro nutrient.']",
				"savedObjectIds['actions']['Water pump cycle']",
				"savedObjectIds['actions']['Light cycle, with lights on between 6am and 10pm.']"
			],
			idealRanges: [
				"savedObjectIds['idealRanges']['Ideal Light - Bloom']",
				"savedObjectIds['idealRanges']['Ideal Air Temp']"
			]
		},
		{
			name : "Fruiting",
			description: "Fruiting phase. Continue to pollinate blossoms and harvest fruit when fully ripened (red).",
			expectedNumberOfDays: 21,
			light: {
				fixture: "savedObjectIds['lightFixtures']['metal halide']",
				fixtureQuantity: 1,
				bulb: "savedObjectIds['lightBulbs']['metal halide']",
			},
			growSystem: "savedObjectIds['growSystems']['Drip']",
			growMedium: "hydroton",
			nutrients: [
				"savedObjectIds['nutrients']['Grow']",
				"savedObjectIds['nutrients']['Bloom']",
				"savedObjectIds['nutrients']['Micro']"
			],
			actions: [
				"savedObjectIds['actions']['Flush and refill reservoir. Discard any solution in the reservoir, rinse the entire system with water. Then refill the reservoir to capacity with water. Mix in ¼ cup Grow nutrient, then ¼ cup Bloom nutrient, then ¼ cup Micro nutrient.']",
				"savedObjectIds['actions']['Water pump cycle']",
				"savedObjectIds['actions']['Light cycle, with lights on between 6am and 10pm.']"
			],
			idealRanges: [
				"savedObjectIds['idealRanges']['Ideal Light - Bloom']",
				"savedObjectIds['idealRanges']['Ideal Air Temp']"
			]
		}
	];