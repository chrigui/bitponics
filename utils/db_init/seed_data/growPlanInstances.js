module.exports = [
		{
			gpid: "1",
			users : [
				"savedObjectIds['users']['jack@bitponics.com']"
			],
			owner : "savedObjectIds['users']['jack@bitponics.com']",
			growPlan : "savedObjectIds['growPlans']['Tomato']",
			device : "savedObjectIds['devices']['0006667211cf']", //TODO: bitponics device
			startDate: 1347364818821, // 09/11/2012
			endDate: 1351742400000, // 11/01/2012
		    active: true,
			phases: [
				{
					phase: "savedObjectIds['phases']['Vegetative']",
					startDate: 1347364818821, // 09/11/2012
					endDate: 1351742400000, // 11/01/2012
					active: true
				},
				{
					phase: "savedObjectIds['phases']['Blooming']",
					startDate: 1351828800000, // 11/02/2012
					endDate: 1357016400000, // 01/01/2013
					active: false
				},
				{
					phase: "savedObjectIds['phases']['Fruiting']",
					startDate: 1357102800000, // 01/02/2013
					endDate: 1362200400000, // 03/01/2013
					active: false
				}
			],
			sensorLogs: [
				{
					timestamp: 1347364818821,
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
					timestamp: 1347364828821,
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
					timestamp: 1347364838821,
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
			controlLogs: [
				{
					timestamp: 1347364838821,
					logs : [
						{
							control: "savedObjectIds['controls']['Fan']",
							value: 0
						},
						{
							control: "savedObjectIds['controls']['Fan']",
							value: 1
						},
						{
							control: "savedObjectIds['controls']['Fan']",
							value: 0
						}	
					]
				}
			],
			photoLogs: [
				{
					timestamp: 1347364838821,
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
			genericLogs: [
				{
					timestamp: 1347364838821,
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
			gpid: "2",
			users : [
				"savedObjectIds['users']['jack@bitponics.com']"
			],
			owner : "savedObjectIds['users']['jack@bitponics.com']",
			growPlan : "savedObjectIds['growPlans']['Tomato']",
			device : "savedObjectIds['devices']['0006667211cf']", //TODO: bitponics device
			startDate: 1347364818821, // 09/11/2012
			endDate: 1351742400000, // 11/01/2012
		    active: false,
			phases: [
				{
					phase: "savedObjectIds['phases']['Vegetative']",
					startDate: 1347364818821, // 09/11/2012
					endDate: 1351742400000, // 11/01/2012
					active: true
				},
				{
					phase: "savedObjectIds['phases']['Blooming']",
					startDate: 1351828800000, // 11/02/2012
					endDate: 1357016400000, // 01/01/2013
					active: false
				},
				{
					phase: "savedObjectIds['phases']['Fruiting']",
					startDate: 1357102800000, // 01/02/2013
					endDate: 1362200400000, // 03/01/2013
					active: false
				}
			],
			sensorLogs: [
				{
					timestamp: 1347364818821,
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
					timestamp: 1347364828821,
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
					timestamp: 1347364838821,
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
			controlLogs: [
				{
					timestamp: 1347364838821,
					logs : [
						{
							control: "savedObjectIds['controls']['Fan']",
							value: 0
						},
						{
							control: "savedObjectIds['controls']['Fan']",
							value: 1
						},
						{
							control: "savedObjectIds['controls']['Fan']",
							value: 0
						}	
					]
				}
			],
			photoLogs: [
				{
					timestamp: 1347364838821,
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
			genericLogs: [
				{
					timestamp: 1347364838821,
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