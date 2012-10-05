var ObjectId = mongoose = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id : '506de2fe8eebf7524342cb38',
			gpid: "1",
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
			startDate: 1347364818821, // 09/11/2012
			endDate: 1351742400000, // 11/01/2012
		    active: true,
			phases: [
				{
					phase: "506de3048eebf7524342cb4f",
					startDate: 1347364818821, // 09/11/2012
					endDate: 1351742400000, // 11/01/2012
					active: true
				},
				{
					phase: "506de3048eebf7524342cb50",
					startDate: 1351828800000, // 11/02/2012
					endDate: 1357016400000, // 01/01/2013
					active: false
				},
				{
					phase: "506de3048eebf7524342cb51",
					startDate: 1357102800000, // 01/02/2013
					endDate: 1362200400000, // 03/01/2013
					active: false
				}
			],
			recentSensorLogs: [
				{
					ts: 1347364818821,
					logs : [
						{
							sCode: "ph",
							value: 6.25
						},
						{
							sCode: "air",
							value: 30
						},
						{
							sCode: "water",
							value: 35
						}
					]
				},
				{
					ts: 1347364828821,
					logs : [
						{
							sCode: "ph",
							value: 7.25
						},
						{
							sCode: "air",
							value: 33
						},
						{
							sCode: "water",
							value: 34
						}
					]
				},
				{
					ts: 1347364838821,
					logs : [
						{
							sCode: "ph",
							value: 6.5
						},
						{
							sCode: "air",
							value: 34
						},
						{
							sCode: "water",
							value: 33
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
							entry: "Tomatoes are awesome.",
							tags: ["awesome"],
							logType: ""
						}
					]
				}
			]
		},


		{
			_id : '506de2ff8eebf7524342cb39',
			gpid: "2",
			users : [
				"506de3098eebf7524342cb66"
			],
			owner : "506de3098eebf7524342cb66",
			growPlan : "506de2ff8eebf7524342cb3b",
			device : "506de2fe8eebf7524342cb34", //TODO: bitponics device
			startDate: 1347364818821, // 09/11/2012
			endDate: 1351742400000, // 11/01/2012
		    active: false,
			phases: [
				{
					phase: "506de3048eebf7524342cb4f",
					startDate: 1347364818821, // 09/11/2012
					endDate: 1351742400000, // 11/01/2012
					active: true
				},
				{
					phase: "506de3048eebf7524342cb50",
					startDate: 1351828800000, // 11/02/2012
					endDate: 1357016400000, // 01/01/2013
					active: false
				},
				{
					phase: "506de3048eebf7524342cb51",
					startDate: 1357102800000, // 01/02/2013
					endDate: 1362200400000, // 03/01/2013
					active: false
				}
			],
			recentSensorLogs: [
				{
					ts: 1347364818821,
					logs : [
						{
							sCode: "ph",
							value: 6.25
						},
						{
							sCode: "air",
							value: 30
						},
						{
							sCode: "water",
							value: 35
						}
					]
				},
				{
					ts: 1347364828821,
					logs : [
						{
							sCode: "ph",
							value: 7.25
						},
						{
							sCode: "air",
							value: 33
						},
						{
							sCode: "water",
							value: 34
						}
					]
				},
				{
					ts: 1347364838821,
					logs : [
						{
							sCode: "ph",
							value: 6.5
						},
						{
							sCode: "air",
							value: 34
						},
						{
							sCode: "water",
							value: 33
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
							entry: "Tomatoes are awesome.",
							tags: ["awesome"],
							logType: ""
						}
					]
				}
			]
		}

	];