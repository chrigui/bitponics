var ObjectId = mongoose = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id : '506de2ff8eebf7524342cb3a',
			//parentGrowPlanId: { type: ObjectId, ref: 'GrowPlan' },
			createdByUserId: "506de3098eebf7524342cb66",
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
			//parentGrowPlanId: { type: ObjectId, ref: 'GrowPlan' },
			createdByUserId: "506de3098eebf7524342cb66",
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