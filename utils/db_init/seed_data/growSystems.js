var ObjectIdSchema = require('mongoose').Schema.ObjectId;

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
			_id : '506de30d8eebf7524342cb77',
			name: "Bitponics Water Culture System",
			description: "The system provided to our Kickstarter backers.",
			type: "deep water culture (DWC)",
			reservoirSize: 4.5,
			plantCapacity: 6	
		},
		{
			_id : '506de3008eebf7524342cb40',
			name: "Egg-carton seed starter",
			description: "Seed-starting system made with a plastic egg carton. For full directions on how to make one, go here: http://bitponics.com/guides/water-culture-system. And this system doesn't have room for pH and EC sensors, but you won't need them anyway since in the seed-starting phase you just use plain tap water. So just put the caps on those sensors, unplug them and store them aside until you get to the next phase.",
			type: "deep water culture (DWC)",
			reservoirSize: .1,
			plantCapacity: 12
		},
		{
			_id : '51b0db785dd0f94858bac8df',
			name: "Vertical Wall Garden",
			description: "A vertical wall garden build on a wooden frame, with 4 columns of 12 pockets holding 2 plants each. Using wool pocket planters from Plants On Walls.",
			type: "drip",
			reservoirSize: 15,
			plantCapacity: 96,
			overallSize : {
				w : 4,
				h : 7.5,
				d : 1	
			}
		}
	];