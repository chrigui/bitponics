var ObjectId = mongoose = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id : '506de2ff8eebf7524342cb3c',
			name: "Drip",
			description: "Drip system.",
			type: "deep water culture (DWC)",
			reservoirSize: 5, //gallons
			plantCapacity: 6
		},
		{
			_id : '506de3008eebf7524342cb3d',
			name: "ebb & flow",
			description: "ebb & flow system.",
			type: "ebb & flow",
			reservoirSize: 5,
			plantCapacity: 6
		},
		{
			_id : '506de3008eebf7524342cb3e',
			name: "aquaponics",
			description: "aquaponics system.",
			type: "aquaponics",
			reservoirSize: 90,
			plantCapacity: 10
		},
		{
			_id : '506de3008eebf7524342cb3f',
			name: "deep water culture (DWC)",
			description: "deep water culture (DWC) system.",
			type: "deep water culture (DWC)",
			reservoirSize: 5,
			plantCapacity: 6
		},
		{
			_id : '506de3008eebf7524342cb40',
			name: "Egg-carton seed starter",
			description: "Seed-starting system made with a plastic egg carton. For full directions on how to make one, go here: http://bitponics.com/guides/water-culture-system",
			type: "deep water culture (DWC)",
			reservoirSize: .1,
			plantCapacity: 12
		}
	];