var ObjectId = mongoose = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id : '506de30c8eebf7524342cb70',
			createdBy: "506de30a8eebf7524342cb6c",
			name: "All-Purpose",
			description: "A generic grow plan suitable for running a garden with a wide variety of plants. It won't get you optimum yields for everything, but it's a good starting point while you learn about the specific needs of your plants.",
			plants: [],
			expertiseLevel: "beginner",
			sensors: [
				"506de3068eebf7524342cb59",
				"506de3068eebf7524342cb5a",
				"506de3078eebf7524342cb5d",
				"506de3078eebf7524342cb5e",
				"506de3078eebf7524342cb5f",
				"506de3088eebf7524342cb63"
			],
			controls: [
				"506de2fd8eebf7524342cb32",
				"506de2fc8eebf7524342cb2d"
			],
			phases: [
				{
					_id : '506de30c8eebf7524342cb72',
					name : 'All-Purpose Seedling',
					description: 'Seedling phase, from planting seeds until first true leaves appear. The Bitponics device isn\'t necessary for this phase since seedlings do fine with just plain tap water, and most seed-starting systems are too small for the water sensors anyway. This phase is for the "All-Purpose" grow plan so its sensor ranges aren\'t optimal for any specific plant, but instead describe a range that should be adequate for most plants.',
					expectedNumberOfDays: 7,
					light: {
						fixture: "506de3028eebf7524342cb47",
						fixtureQuantity : 1,
						bulb : "506de3018eebf7524342cb42"
					},
					growSystem: "506de3008eebf7524342cb40",
					growMedium: "rockwool",
					nutrients: [],
					actions: [
						"506de2ec8eebf7524342cb24",
						"506de2ef8eebf7524342cb25",
						"506de2f08eebf7524342cb26",
						"506de2f18eebf7524342cb27"
					],
					idealRanges: [
						{
							_id : '506de30c8eebf7524342cb71',
							sCode: "water",
							valueRange: {
								min: 18.33, // 65 fahrenheit
								max: 21.11 // 70 fahrenheit
							},
							actionBelowMin : "506de30c8eebf7524342cb73",
							actionAboveMax : "506de30d8eebf7524342cb75"
						},
						{
							_id : '506de30d8eebf7524342cb76',
							sCode: "air",
							valueRange: {
								min: 12.77, // 55 fahrenheit
								max: 21.11 // 70 fahrenheit
							},
							actionBelowMin : "506de2fc8eebf7524342cb2b",
							actionAboveMax : "506de2fb8eebf7524342cb2a"
						},
						{
							_id : '506de30b8eebf7524342cb6e',
							sCode: "full",
							valueRange: {
								min: 2000,
								max: 10000
							},
							applicableTimeSpan: {
								startTime: 28800000, //8am
								endTime: 72000000 //8pm
							},
							actionBelowMin : "506de2fb8eebf7524342cb28",
							actionAboveMax : "506de2fb8eebf7524342cb29"
						}
					]
				},
				{
					_id : '506de30e8eebf7524342cb78',
					name : 'All-Purpose Vegetative',
					description: 'Open-ended vegetative phase. Bring in any existing plants or seedlings with their first pair of true leaves.',
					light: {
						fixture: "506de3028eebf7524342cb48",
						fixtureQuantity: 1,
						bulb: "506de3018eebf7524342cb43",
					},
					growSystem: "506de30d8eebf7524342cb77",
					growMedium: "hydroton",
					nutrients: [
						"506de3038eebf7524342cb4b",
						"506de3038eebf7524342cb4c",
						"506de3038eebf7524342cb4d"
					],
					actions: [
						"506de2ec8eebf7524342cb24",
						"506de2ef8eebf7524342cb25",
						"506de2f08eebf7524342cb26",
						"506de2f18eebf7524342cb27"
					],
					idealRanges: [
						{
							_id : '506de30b8eebf7524342cb6d',
							sCode: "full",
							valueRange: {
								min: 2000,
								max: 10000
							},
							applicableTimeSpan: {
								startTime: 21600000, //6am
								endTime: 64800000 //10pm
							},
							actionBelowMin : "506de2fb8eebf7524342cb28",
							actionAboveMax : "506de2fb8eebf7524342cb29"
						},
						{
							_id : '506de30b8eebf7524342cb6f',
							sCode: "air",
							valueRange: {
								min: 30,
								max: 60
							},
							actionBelowMin : "506de2fc8eebf7524342cb2b",
							actionAboveMax : "506de2fb8eebf7524342cb2a"
						}
					]
				}
			]
		},
		{
			_id : '506de2ff8eebf7524342cb3a',
			createdBy: "506de3098eebf7524342cb66",
			name: "Tomato",
			description: "Growing indeterminate organic tomatoes (Redfield Beauty OG) for year round fruiting. Growing in a 3’x3’ grow bed filled with 4\" of hydroton.",
			plants: ["tomatoes"],
			expertiseLevel: "intermediate",
			sensors: [
				"506de3068eebf7524342cb59",
				"506de3078eebf7524342cb5d",
				"506de3078eebf7524342cb5e",
				"506de3068eebf7524342cb5a",
				"506de3078eebf7524342cb5f"
			],
			controls: [
				"506de2fd8eebf7524342cb32"
			],
			phases: [
				{
					_id : '506de3038eebf7524342cb4e',
					name : 'Seedling',
					description: 'Seedling phase, from planting seeds until first true leaves appear. The Bitponics device isn\'t necessary for this phase since seedlings do fine with just plain tap water, and most seed-starting systems are too small for the water sensors anyway.',
					expectedNumberOfDays: 10,
					light: {
						fixture: "506de3028eebf7524342cb47",
						fixtureQuantity : 1,
						bulb : "506de3018eebf7524342cb42"
					},
					growSystem: "506de3008eebf7524342cb40",
					growMedium: "rockwool",
					nutrients: [],
					actions: [
						"506de2ec8eebf7524342cb24",
						"506de2ef8eebf7524342cb25",
						"506de2f08eebf7524342cb26",
						"506de2f18eebf7524342cb27"
					],
					idealRanges: [
						{
							_id : '506de30e8eebf7524342cb7b',
							sCode: "full",
							valueRange: {
								min: 2000,
								max: 10000
							},
							applicableTimeSpan: {
								startTime: 21600000, //6am
								endTime: 64800000 //10pm
							},
							actionBelowMin : "506de2fb8eebf7524342cb28",
							actionAboveMax : "506de2fb8eebf7524342cb29"
						},
						{
							_id : '506de30f8eebf7524342cb7c',
							sCode: "air",
							valueRange: {
								min: 30,
								max: 60
							},
							actionBelowMin : "506de2fc8eebf7524342cb2b",
							actionAboveMax : "506de2fb8eebf7524342cb2a"
						}
					]
				},
				
				{
					_id : '506de3048eebf7524342cb4f',
					name : 'Vegetative',
					description: 'Vegetative phase. Bring in any existing plants or seedlings with their first pair of true leaves.',
					expectedNumberOfDays: 28,
					light: {
						fixture: "506de3028eebf7524342cb48",
						fixtureQuantity: 1,
						bulb: "506de3018eebf7524342cb43",
					},
					growSystem: "506de2ff8eebf7524342cb3c",
					growMedium: "hydroton",
					nutrients: [
						"506de3038eebf7524342cb4b",
						"506de3038eebf7524342cb4c",
						"506de3038eebf7524342cb4d"
					],
					actions: [
						"506de2ec8eebf7524342cb24",
						"506de2ef8eebf7524342cb25",
						"506de2f08eebf7524342cb26",
						"506de2f18eebf7524342cb27"
					],
					idealRanges: [
						{
							_id : '506de30f8eebf7524342cb7d',
							sCode: "full",
							valueRange: {
								min: 2000,
								max: 10000
							},
							applicableTimeSpan: {
								startTime: 21600000, //6am
								endTime: 64800000 //10pm
							},
							actionBelowMin : "506de2fb8eebf7524342cb28",
							actionAboveMax : "506de2fb8eebf7524342cb29"
						},
						{
							_id : '506de30f8eebf7524342cb7e',
							sCode: "air",
							valueRange: {
								min: 30,
								max: 60
							},
							actionBelowMin : "506de2fc8eebf7524342cb2b",
							actionAboveMax : "506de2fb8eebf7524342cb2a"
						}
					]
				},
				{
					_id : '506de3048eebf7524342cb50',
					name : "Blooming",
					description: "Open-ended blooming phase. After about 7 days, you should begin to see blossoms.",
					expectedNumberOfDays: 7,
					light: {
						fixture: "506de3028eebf7524342cb48",
						fixtureQuantity: 1,
						bulb: "506de3018eebf7524342cb43",
					},
					growSystem: "506de2ff8eebf7524342cb3c",
					growMedium: "hydroton",
					nutrients: [
						"506de3038eebf7524342cb4b",
						"506de3038eebf7524342cb4c",
						"506de3038eebf7524342cb4d"
					],
					actions: [
						"506de2fc8eebf7524342cb2c",
						"506de2ef8eebf7524342cb25",
						"506de2f08eebf7524342cb26",
						"506de2f18eebf7524342cb27"
					],
					idealRanges: [
						{
							_id : '506de30f8eebf7524342cb7f',
							sCode: "full",
							valueRange: {
								min: 2000,
								max: 10000
							},
							applicableTimeSpan: {
								startTime: 21600000, //6am
								endTime: 64800000 //10pm
							},
							actionBelowMin : "506de2fb8eebf7524342cb28",
							actionAboveMax : "506de2fb8eebf7524342cb29"
						},
						{
							_id : '506de3108eebf7524342cb80',
							sCode: "air",
							valueRange: {
								min: 30,
								max: 60
							},
							actionBelowMin : "506de2fc8eebf7524342cb2b",
							actionAboveMax : "506de2fb8eebf7524342cb2a"
						}
					]
				},
				{
					_id : '506de3048eebf7524342cb51',
					name : "Fruiting",
					description: "Fruiting phase. Continue to pollinate blossoms and harvest fruit when fully ripened (red).",
					expectedNumberOfDays: 21,
					light: {
						fixture: "506de3028eebf7524342cb48",
						fixtureQuantity: 1,
						bulb: "506de3018eebf7524342cb43",
					},
					growSystem: "506de2ff8eebf7524342cb3c",
					growMedium: "hydroton",
					nutrients: [
						"506de3038eebf7524342cb4b",
						"506de3038eebf7524342cb4c",
						"506de3038eebf7524342cb4d"
					],
					actions: [
						"506de2ef8eebf7524342cb25",
						"506de2f08eebf7524342cb26",
						"506de2f18eebf7524342cb27"
					],
					idealRanges: [
						{
							_id : '506de3108eebf7524342cb81',
							sCode: "full",
							valueRange: {
								min: 2000,
								max: 10000
							},
							applicableTimeSpan: {
								startTime: 21600000, //6am
								endTime: 64800000 //10pm
							},
							actionBelowMin : "506de2fb8eebf7524342cb28",
							actionAboveMax : "506de2fb8eebf7524342cb29"
						},
						{
							_id : '506de3108eebf7524342cb82',
							sCode: "air",
							valueRange: {
								min: 30,
								max: 60
							},
							actionBelowMin : "506de2fc8eebf7524342cb2b",
							actionAboveMax : "506de2fb8eebf7524342cb2a"
						}
					]
				}
			]
		},
		{
			_id : '506de2ff8eebf7524342cb3b',
			createdBy: "506de3098eebf7524342cb66",
			name: "Mixed Greens",
			description: "A grow plan suited for growing any variety of herbs and leafy greens you want. Basil, cilantro, lettuce, swiss chard, throw it all in!",
			plants: ["basil", "swiss chard", "cilantro", "lettuce"],
			expertiseLevel: "intermediate",
			sensors: [
				"506de3068eebf7524342cb59",
				"506de3078eebf7524342cb5d",
				"506de3078eebf7524342cb5e",
				"506de3068eebf7524342cb5a",
				"506de3078eebf7524342cb5f"
			],
			controls: [
				"506de2fd8eebf7524342cb32"
			],
			phases: [
				{
					_id : '506de30e8eebf7524342cb79',
					name : 'Seedling',
					description: 'Seedling phase, from planting seeds until first true leaves appear. The Bitponics device isn\'t necessary for this phase since seedlings do fine with just plain tap water, and most seed-starting systems are too small for the water sensors anyway.',
					expectedNumberOfDays: 10,
					light: {
						fixture: "506de3028eebf7524342cb47",
						fixtureQuantity : 1,
						bulb : "506de3018eebf7524342cb42"
					},
					growSystem: "506de3008eebf7524342cb40",
					growMedium: "rockwool",
					nutrients: [],
					actions: [
						"506de2ec8eebf7524342cb24",
						"506de2ef8eebf7524342cb25",
						"506de2f08eebf7524342cb26",
						"506de2f18eebf7524342cb27"
					],
					idealRanges: [
						{
							_id : '506de3118eebf7524342cb83',
							sCode: "full",
							valueRange: {
								min: 2000,
								max: 10000
							},
							applicableTimeSpan: {
								startTime: 21600000, //6am
								endTime: 64800000 //10pm
							},
							actionBelowMin : "506de2fb8eebf7524342cb28",
							actionAboveMax : "506de2fb8eebf7524342cb29"
						},
						{
							_id : '506de3118eebf7524342cb84',
							sCode: "air",
							valueRange: {
								min: 30,
								max: 60
							},
							actionBelowMin : "506de2fc8eebf7524342cb2b",
							actionAboveMax : "506de2fb8eebf7524342cb2a"
						}
					]
				},
				
				{
					_id : '506de30e8eebf7524342cb7a',
					name : 'Vegetative',
					description: 'Vegetative phase. Bring in any existing plants or seedlings with their first pair of true leaves.',
					expectedNumberOfDays: 28,
					light: {
						fixture: "506de3028eebf7524342cb48",
						fixtureQuantity: 1,
						bulb: "506de3018eebf7524342cb43",
					},
					growSystem: "506de2ff8eebf7524342cb3c",
					growMedium: "hydroton",
					nutrients: [
						"506de3038eebf7524342cb4b",
						"506de3038eebf7524342cb4c",
						"506de3038eebf7524342cb4d"
					],
					actions: [
						"506de2ec8eebf7524342cb24",
						"506de2ef8eebf7524342cb25",
						"506de2f08eebf7524342cb26",
						"506de2f18eebf7524342cb27"
					],
					idealRanges: [
						{
							_id : '506de3118eebf7524342cb85',
							sCode: "full",
							valueRange: {
								min: 2000,
								max: 10000
							},
							applicableTimeSpan: {
								startTime: 21600000, //6am
								endTime: 64800000 //10pm
							},
							actionBelowMin : "506de2fb8eebf7524342cb28",
							actionAboveMax : "506de2fb8eebf7524342cb29"
						},
						{
							_id : '506de3118eebf7524342cb86',
							sCode: "air",
							valueRange: {
								min: 30,
								max: 60
							},
							actionBelowMin : "506de2fc8eebf7524342cb2b",
							actionAboveMax : "506de2fb8eebf7524342cb2a"
						}
					]
				}
			]
		}
	];