var data = {
	sensors: [
		{
			name : "pH",
			unit: "pH",
			code: "ph"
		},
		{
			name: "Electrical Conductivity",
			abbrev: "EC",
			unit: "Microsiemens", //=> µs
			code: "ec"
		},
		{
			name: "Total Dissolved Solids",
			abbrev: "TDS",
			unit: "parts per million",
			code: "tds"
		},
		{	name: "Salinity",
			abbrev: "SAL",
			unit: "percentage",
			code: "sal"
		}, 
		{
			name: "Air Temperature",
			unit: "celsius",
			code: "air"
		},
		{
			name: "Water Temperature",
			unit: "celsius",
			code: "water"
		},
		{
			name: "Humidity",
			unit: "percentage",
			code: "hum"
		},
		{
			name: "Carbon Dioxide",
			abbrev: "CO2",
			unit: "parts per million",
			code: "co2"
		},
		{
			name: "Lux",
			abbrev: "Lux",
			unit: "Lumens",
			code: "lux"
		},
		{
			name: "Infrared",
			abbrev: "IR",
			unit: "Lumens",
			code: "ir"
		},
		{
			name: "Full Light",
			unit: "Lumens",
			code: "full"
		},
		{
			name: "Visible Light",
			unit: "Lumens",
			code: "vis"
		}
	],
	nutrients: [
		{
			brand: "Humbolt Nutrients",
			name: "Grow"
		},
		{
			brand: "Humbolt Nutrients",
			name: "Bloom"
		},
		{
			brand: "Humbolt Nutrients",
			name: "Micro"
		},
	],
	deviceTypes: [
		{
			name: "Bitponics Beta Device 1",
			firmwareVersion: "0.1",
			microprocessor: "blah",
			sensorMap: [
				{ 
					outputId: "ph",
					sensor: "{sensor}" // ref to pH Sensor instance"s ObjectId
				},
				{	outputId: "ec",
					sensor:	"{sensor}"
				},
				{
					outputId: "tds",
					sensor: "{sensor}"
				},
				{
					outputId: "sal",
					sensor: "{sensor}"
				},
				{
					outputId: "air",
					sensor: "{sensor}"
				},
				{
					outputId: "water",
					sensor: "{sensor}"
				},
				{
					outputId: "hum",
					sensor: "{sensor}"
				},
				{
					outputId: "co2",
					sensor: "{sensor}"
				},
				{
					outputId: "lux",
					sensor: "{sensor}"
				},
				{
					outputId: "ir",
					sensor: "{sensor}"
				},
				{	
					outputId: "full",
					sensor: "{sensor}"
				},
				{
					outputId: "vis",
					sensor: "{sensor}"
				}
			]
		}
	],
	lights: [
		{
			type: "fluorescent",
			watts: 40,
			brand : "lights.com",
			name : "fluorescent"
		},
		{
			type: "metal halide",
			watts: 90,
			brand : "lights.com",
			name : "metal halide"
		},
		{
			type: "high pressure sodium (HPS)",
			watts: 120,
			brand : "lights.com",
			name : "high pressure sodium (HPS)"
		},
		{
			type: "LED",
			watts: 10,
			brand : "lights.com",
			name : "LED"
		}
	],
	growSystems: [
		{
			name: "Drip",
			description: "Drip system.",
			type: "deep water culture (DWC)",
			reservoirSize: 5, //gallons?
			numberOfPlants: 6
		},
		{
			name: "ebb & flow",
			description: "ebb & flow system.",
			type: "ebb & flow",
			reservoirSize: 5,
			numberOfPlants: 6
		},
		{
			name: "aquaponics",
			description: "aquaponics system.",
			type: "aquaponics",
			reservoirSize: 90,
			numberOfPlants: 10
		},
		{
			name: "deep water culture (DWC)",
			description: "deep water culture (DWC) system.",
			type: "deep water culture (DWC)",
			reservoirSize: 5,
			numberOfPlants: 6
		}
	],
	controls: [
		{
			name: "Water Pump"
		},
		{
			name: "Humidifier"
		},
		{
			name: "Some Control"
		}
	],
	actions: [
		{
			description: "Transplant seedlings into the grow bed",
			controlMessage: undefined,
			startTime: 0, // trigger as soon as the phase starts
			recurrence: undefined,
			cycle: undefined
		},
		{
			description: "Flush and refill reservoir. Discard any solution in the reservoir, rinse the entire system with water. Then refill the reservoir to capacity with water. Mix in ¼ cup Grow nutrient, then ¼ cup Bloom nutrient, then ¼ cup Micro nutrient.",
			controlMessage: undefined,
			startTime: 0, // trigger as soon as the phase starts
			cycle: undefined,
			recurrence: {
				repeatType: "Weekly",
				frequency: 4,
				numberOfTimes: undefined  // undefined for infinite recurrence
			}
		}, // end flush Action
		{
			description: "Water pump cycle",
			control: "{Pump}", // reference to Pump control
			startTime: 0,
			cycle: {
				states: [
					{
						controlValue: 1,
						duration: 900000, // 15 min in milliseconds
						message: "Turn pump on for 15 minutes"
					},
					{
						controlValue: 0,
						duration: 900000, // 15 min in millisecond
						message: "Turn pump off for 15 minutes"
					}
				],
				stopAfterRepetitionCount : undefined
			},
			recurrence: undefined	
		}, // end "Water pump cycle" action	
		{
			description: "Turn light on",
			controlMessage: {
				controlReference : "{Light}",
				valueToSend: 255
			},
			startTime: 21600000, //6 hours
			recurrence: {
				repeatType: "Daily",
				frequency: 1,
				numOfTimes: undefined  // undefined for infinite recurrence
			}	
		}, // end "Turn light on." action	
		{
			description: "Turn light off",
			controlMessage: {
				controlReference : "{Light}",
				valueToSend: 0
			},
			startTime: 72000000, //20 hours
			recurrence: {
				repeatType: "Daily",
				frequency: 1,
				numOfTimes: undefined  // undefined for infinite recurrence
			}
		}, // end "Turn light off" action
		{
			description: "Light levels have dropped. Turn on supplemental lighting.",
			controlMessage: {
				controlReference: "{Light}",
				valueToSend: 255
			}
		},
		{
			description: "Light levels above recommendations. Turn off any supplemental lights.",
			controlMessage: {
				controlReference: "{Light}",
				valueToSend: 0
			}
		}
	],
	idealRanges: [
		{
			name: "Ideal Light",
			sensor: "{light sensor}",
			valueRange: {
				min: 2000,
				max: 10000
			},
			applicableTimeSpan: {
				startTime: 21600000, //6am
				endTime: 64800000 //10pm
			},
			actionBelowMin : "{turn on light action}",
			actionAboveMax : "{turn off light action}"
		}
	],
	phases: [
		{}
	],
	grow_plans: [
		{}
	],
	grow_plan_instances: [
		{}
	],
	users: [
		{}
	]
}

module.exports = data;