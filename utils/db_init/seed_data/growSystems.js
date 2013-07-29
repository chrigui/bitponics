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
			_id : '51e89a96849a131883eb82d6',
			name: "Bitponics Glass Curtain",
			description: "Columns of plants grown in custom glass vessels, hung on steel wires extending from floor to ceiling. Originally designed for PSFK's \"Future of Home Living\" exhibit in the summer of 2013.",
			type: "drip",
			reservoirSize: 30,
			plantCapacity: 25,
			overallSize : {
				w : 7,
				h : 13,
				d : 2
			}
		},
		{
			_id: "51e89c2b849a131883eb82d7",
			name: "72-cell seed starter",
			description: "",
			type: "deep water culture (DWC)",
			reservoirSize: .1,
			plantCapacity : 72
		},
		{
			_id: "51eb73886b21df1a6a836b50",
			name: "Bitponics Microgreens Kitchen Island",
			description: "A beautiful wooden 4'x2' kitchen island with a butcher-block countertop and 8 pull-out drawers of microgreen trays, with built-in LED lighting for each drawer.",
			type: "Nutrient Film Technique (NFT)",
			reservoirSize: 10,
			plantCapacity : 800,
			overallSize : {
				w : 4,
				h : 3,
				d : 2
			}
		}
	];