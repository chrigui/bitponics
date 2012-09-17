module.exports = [
		{
			name: "Ideal Light - Vegetative",
			sensor: "savedObjectIds['lights']['fluorescent']",
			valueRange: {
				min: 2000,
				max: 10000
			},
			applicableTimeSpan: {
				startTime: 21600000, //6am
				endTime: 64800000 //10pm
			},
			actionBelowMin : "savedObjectIds['actions']['Light levels have dropped. Turn on supplemental lighting.']",
			actionAboveMax : "savedObjectIds['actions']['Light levels above recommendations. Turn off any supplemental lights.']"
		},
		{
			name: "Ideal Light - Bloom",
			sensor: "savedObjectIds['lights']['fluorescent']",
			valueRange: {
				min: 2000,
				max: 10000
			},
			applicableTimeSpan: {
				startTime: 28800000, //8am
				endTime: 72000000 //8pm
			},
			actionBelowMin : "savedObjectIds['actions']['Light levels have dropped. Turn on supplemental lighting.']",
			actionAboveMax : "savedObjectIds['actions']['Light levels above recommendations. Turn off any supplemental lights.']"
		},
		{
			name: "Ideal Air Temp",
			sensor: "savedObjectIds['sensors']['air']",
			valueRange: {
				min: 30,
				max: 60
			},
			actionBelowMin : "savedObjectIds['actions']['Air temperature is too low. Turn on heater.']",
			actionAboveMax : "savedObjectIds['actions']['Air temperature is too high. Turn on air conditioner.']"
		}
	];