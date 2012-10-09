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
				"506de30c8eebf7524342cb72",
				"506de30e8eebf7524342cb78"
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
				"506de3048eebf7524342cb4f",
				"506de3048eebf7524342cb50",
				"506de3048eebf7524342cb51"
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
				"506de3048eebf7524342cb4f",
				"506de3048eebf7524342cb50",
				"506de3048eebf7524342cb51"
			]
		}
	];