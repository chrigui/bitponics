module.exports = [
		{
			name : 'Vegetative',
			description: 'Open-ended vegetative phase. Bring in any existing plants or seedlings with their first pair of true leaves.',
			expectedTimeSpan: undefined,
			lightingType: "savedObjectIds['lights']['metal halide']",
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
			description: "Open-ended booming phase. After about 70 days, you should begin to see blossoms.",
			expectedTimeSpan: undefined,
			lightingType: "savedObjectIds['lights']['metal halide']",
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
			expectedTimeSpan: undefined,
			lightingType: "savedObjectIds['lights']['compact fluorescent']",
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