var ObjectIdSchema = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id : '506de30c8eebf7524342cb70',
			createdBy: "506de30a8eebf7524342cb6c",
			name: "All-Purpose",
			description: "A generic grow plan suitable for running a garden with a wide variety of plants. It won't get you optimum yields for everything, but it's a good starting point while you learn about the specific needs of your plants.",
			plants: [],
			phases: [
				{
					_id : '506de30c8eebf7524342cb72',
					name : 'Seedling',
					description: 'Seedling phase, from planting seeds until first true leaves appear. The Bitponics device isn\'t necessary for this phase since seedlings do fine with just plain tap water, and most seed-starting systems are too small for the water sensors anyway. This phase is for the "All-Purpose" grow plan so its sensor ranges aren\'t optimal for any specific plant, but instead describe a range that should be adequate for most plants.',
					expectedNumberOfDays: 7,
					light: "515a540205e45bc5a590301b",
					growSystem: "506de3008eebf7524342cb40",
					growMedium: "rockwool",
					nutrients: [],
					actions: [
						"506de3128eebf7524342cb87",
						"506de2f18eebf7524342cb27"
					],
					phaseEndActions : [
					],
					phaseEndDescription: "This phase is over once the seedlings start growing their first true leaves.",
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
							sCode: "lux",
							valueRange: {
								min: 2000,
								max: 4000
							},
							applicableTimeSpan: {
								startTime: (6 * 60 * 60 * 1000), //6am
								endTime: (22 * 60 * 60 * 1000)//10pm
							},
							actionBelowMin : "506de2fb8eebf7524342cb28",
							actionAboveMax : "506de2fb8eebf7524342cb29"
						}
					]
				},
				{
					_id : '506de30e8eebf7524342cb78',
					name : 'Vegetative',
					description: 'Open-ended vegetative phase. Bring in any existing plants or seedlings with their first pair of true leaves.',
					expectedNumberOfDays: 28,
					light: "515a540a05e45bc5a590301d",
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
              sCode: "lux",
              valueRange: {
                min: 15000,
                max: 27000
              },
              applicableTimeSpan: {
                startTime: (6 * 60 * 60 * 1000), //6am
                endTime: (22 * 60 * 60 * 1000)//10pm
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
			plants: ["50749126fe420e210be58a6d"],
			phases: [
				{
					_id : '506de3038eebf7524342cb4e',
					name : 'Seedling',
					description: 'Seedling phase, from planting seeds until first true leaves appear. The Bitponics device isn\'t necessary for this phase since seedlings do fine with just plain tap water, and most seed-starting systems are too small for the water sensors anyway.',
					expectedNumberOfDays: 10,
					light: "515a540205e45bc5a590301b",
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
              sCode: "lux",
              valueRange: {
                min: 3000,
                max: 4000
              },
              applicableTimeSpan: {
                startTime: (6 * 60 * 60 * 1000), //6am
                endTime: (22 * 60 * 60 * 1000)//10pm
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
					light: "515a540a05e45bc5a590301d",
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
              sCode: "lux",
              valueRange: {
                min: 20000,
                max: 27000
              },
              applicableTimeSpan: {
                startTime: (6 * 60 * 60 * 1000), //6am
                endTime: (22 * 60 * 60 * 1000)//10pm
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
					light: "515a540a05e45bc5a590301e",
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
              sCode: "lux",
              valueRange: {
                min: 50000,
                max: 107500
              },
              applicableTimeSpan: {
                startTime: (8 * 60 * 60 * 1000), //8am
                endTime: (20 * 60 * 60 * 1000)//8pm
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
					light: "515a540a05e45bc5a590301e",
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
              sCode: "lux",
              valueRange: {
                min: 50000,
                max: 107500
              },
              applicableTimeSpan: {
                startTime: (8 * 60 * 60 * 1000), //8am
                endTime: (20 * 60 * 60 * 1000)//8pm
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
			plants: ["50749120fe420e210be58a69", "50a016f8eb1164c6b88e3038", "5074983aab364e2a9fffd4f1", "5074912dfe420e210be58a82"],
			phases: [
				{
					_id : '506de30e8eebf7524342cb79',
					name : 'Seedling',
					description: 'Seedling phase, from planting seeds until first true leaves appear. The Bitponics device isn\'t necessary for this phase since seedlings do fine with just plain tap water, and most seed-starting systems are too small for the water sensors anyway.',
					expectedNumberOfDays: 10,
					light: "515a540205e45bc5a590301b",
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
              sCode: "lux",
              valueRange: {
                min: 2000,
                max: 4000
              },
              applicableTimeSpan: {
                startTime: (6 * 60 * 60 * 1000), //6am
                endTime: (22 * 60 * 60 * 1000)//10pm
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
					light: "515a540a05e45bc5a590301d",
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
              sCode: "lux",
              valueRange: {
                min: 15000,
                max: 27000
              },
              applicableTimeSpan: {
                startTime: (6 * 60 * 60 * 1000), //6am
                endTime: (22 * 60 * 60 * 1000)//10pm
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