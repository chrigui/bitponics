var ObjectId = mongoose = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id : '506de2fe8eebf7524342cb38',
			users : [
				"506de3098eebf7524342cb66",
				"506de3098eebf7524342cb67",
				"506de30a8eebf7524342cb6c",
				"506de3098eebf7524342cb68",
				"506de30a8eebf7524342cb69",
				"506de30a8eebf7524342cb6a",
				"506de30a8eebf7524342cb6b"
			],
			owner : "506de3098eebf7524342cb66",
			growPlan : "506de2ff8eebf7524342cb3a",
			device : "506de2fe8eebf7524342cb34", //TODO: bitponics device
			startDate: '2012 09 11 00:00:00 GMT-0400 (EDT)', // 09/11/2012
			active: true,
			phases: [
				{
					phase: "506de3038eebf7524342cb4e",
					startDate: '2012 09 11 00:00:00 GMT-0400 (EDT)', // 09/11/2012
					endDate: null, // 11/01/2012
					active: true
				},
				{
					phase: "506de3048eebf7524342cb4f",
					active: false
				},
				{
					phase: "506de3048eebf7524342cb50",
					active: false
				},
				{
					phase : "506de3048eebf7524342cb51",
					active: false
				}
			],
			recentSensorLogs: [
				{
					ts: 1347364818821,
					logs : [
						{
							sCode: "ph",
							val: 6.25
						},
						{
							sCode: "air",
							val: 30
						},
						{
							sCode: "water",
							val: 35
						}
					]
				},
				{
					ts: 1347364828821,
					logs : [
						{
							sCode: "ph",
							val: 7.25
						},
						{
							sCode: "air",
							val: 33
						},
						{
							sCode: "water",
							val: 34
						}
					]
				},
				{
					ts: 1347364838821,
					logs : [
						{
							sCode: "ph",
							val: 6.5
						},
						{
							sCode: "air",
							val: 34
						},
						{
							sCode: "water",
							val: 33
						}
					]
				}
			],
			recentPhotoLogs: [
				{
					ts: 1347364838821,
					logs : [
						{
							url: "http://cityexile.files.wordpress.com/2009/04/tomato_seedling1.jpg",
							tags: ["tomato, seedling, grow"]
						},
						{
							url: "http://blog.japantimes.co.jp/japan-pulse/files/2012/08/tomato1.jpg",
							tags: ["tomato, fruiting"]
						}
					]
				}
			],
			recentTagLogs: [
				{
					ts: 1347364838821,
					logs : [
						{
							val: "Tomatoes are awesome.",
							tags: ["awesome"],
							logType: ""
						}
					]
				}
			]
		},


		{
			_id : '506de2ff8eebf7524342cb39',
			users : [
				"506de3098eebf7524342cb66"
			],
			owner : "506de3098eebf7524342cb66",
			growPlan : "506de2ff8eebf7524342cb3b",
			device : "506de2fe8eebf7524342cb34", //TODO: bitponics device
			startDate: 1347364818821, // 09/11/2012
			active: false,
			phases: [
				{
					phase: "506de30e8eebf7524342cb79",
					startDate: 1347364818821, // 09/11/2012
					active: true
				},
				{
					phase: "506de30e8eebf7524342cb7a",
					active: false
				}
			],
			recentSensorLogs: [
				{
					ts: 1347364818821,
					logs : [
						{
							sCode: "ph",
							val: 6.25
						},
						{
							sCode: "air",
							val: 30
						},
						{
							sCode: "water",
							val: 35
						}
					]
				},
				{
					ts: 1347364828821,
					logs : [
						{
							sCode: "ph",
							val: 7.25
						},
						{
							sCode: "air",
							val: 33
						},
						{
							sCode: "water",
							val: 34
						}
					]
				},
				{
					ts: 1347364838821,
					logs : [
						{
							sCode: "ph",
							val: 6.5
						},
						{
							sCode: "air",
							val: 34
						},
						{
							sCode: "water",
							val: 33
						}
					]
				}
			],
			recentPhotoLogs: [
				{
					ts: 1347364838821,
					logs : [
						{
							url: "http://cityexile.files.wordpress.com/2009/04/tomato_seedling1.jpg",
							tags: ["tomato, seedling, grow"]
						},
						{
							url: "http://blog.japantimes.co.jp/japan-pulse/files/2012/08/tomato1.jpg",
							tags: ["tomato, fruiting"]
						}
					]
				}
			],
			recentTagLogs: [
				{
					ts: 1347364838821,
					logs : [
						{
							val: "Tomatoes are awesome.",
							tags: ["awesome"],
							logType: ""
						}
					]
				}
			]
		}

	];