var ObjectIdSchema = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id : '506de3008eebf7524342cb41',
			type: "Fluorescent",
			watts: 12,
			brand : "Hydrofarm",
			name : "2-foot T5 bulb"
		},
		{
			_id : '506de3018eebf7524342cb42',
			type: "CFL",
			watts: 40,
			brand : "",
			name : "Any standard CFL bulb"
		},
		{
			_id : '506de3018eebf7524342cb43',
			type: "Metal Halide",
			watts: 250,
			brand : "",
			name : "Metal Halide"
		},
		{
			_id : '506de3018eebf7524342cb44',
			type: "High Pressure Sodium (HPS)",
			watts: 300,
			brand : "",
			name : "High Pressure Sodium (HPS)"
		},
		{
			_id : '506de3018eebf7524342cb45',
			type: "LED",
			watts: 10,
			brand : "",
			name : "LED"
		}
	];