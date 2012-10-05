var ObjectId = mongoose = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id : '506de3028eebf7524342cb46',
			type: "fluorescent",
			watts: 48,
			brand : "Hydrofarm",
			name : "T5 2-tube 2-foot System",
			bulbCapacity : 4
		},
		{
			_id : '506de3028eebf7524342cb47',
			type: "compact fluorescent",
			watts: 40,
			brand : "",
			name : "Any fixture that takes 1 standard CFL bulb.",
			bulbCapacity : 1
		},
		{
			_id : '506de3028eebf7524342cb48',
			type: "metal halide",
			watts: 250,
			brand : "lights.com",
			name : "metal halide",
			bulbCapacity : 1
		},
		{
			_id : '506de3028eebf7524342cb49',
			type: "high pressure sodium (HPS)",
			watts: 300,
			brand : "lights.com",
			name : "high pressure sodium (HPS)",
			bulbCapacity : 1
		},
		{
			_id : '506de3028eebf7524342cb4a',
			type: "LED",
			watts: 10,
			brand : "lights.com",
			name : "LED",
			bulbCapacity : 1
		}
	];