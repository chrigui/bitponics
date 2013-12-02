var ObjectIdSchema = require('mongoose').Schema.ObjectId;

module.exports = [
{
  "_id" : "51b0db785dd0f94858bac8df",
  "name" : "Vertical Wall Garden",
  "description" : "A vertical wall garden build on a wooden frame, with 4 columns of 12 pockets holding 2 plants each. Using wool pocket planters from Plants On Walls.",
  "type" : "drip",
  "reservoirSize" : 15,
  "plantCapacity" : 96,
  "visibility" : "public",
  "overallSize" : {
    "w" : 4,
    "h" : 7.5,
    "d" : 1
  }
},
{
  "_id" : "51e89a96849a131883eb82d6",
  "name" : "Bitponics Glass Curtain",
  "description" : "Columns of plants grown in custom glass vessels, hung on steel wires extending from floor to ceiling. Originally designed for PSFK's \"Future of Home Living\" exhibit in the summer of 2013.",
  "type" : "drip",
  "reservoirSize" : 30,
  "plantCapacity" : 25,
  "visibility" : "public",
  "overallSize" : {
    "w" : 7,
    "h" : 13,
    "d" : 2
  }
},
{
  "_id" : "51e8a38e4cba0a0200000805",
  "name" : "72-cell seed starter",
  "description" : "",
  "type" : "seed starter/cloner",
  "reservoirSize" : 0.1,
  "plantCapacity" : 72,
  "createdBy" : "506de30a8eebf7524342cb6c",
  "visibility" : "public"
},
{
  "_id" : "51eb73886b21df1a6a836b50",
  "name" : "Bitponics Microgreens Kitchen Island",
  "description" : "A beautiful wooden 4'x2' kitchen island with a butcher-block countertop and 8 pull-out drawers of microgreen trays, with built-in LED lighting for each drawer.",
  "type" : "Nutrient Film Technique (NFT)",
  "reservoirSize" : 10,
  "plantCapacity" : 800,
  "visibility" : "public",
  "overallSize" : {
    "w" : 4,
    "h" : 3,
    "d" : 2
  }
},
{
  "_id" : "506de30d8eebf7524342cb77",
  "description" : "The system provided to our Kickstarter backers.",
  "name" : "Bitponics Water Culture System",
  "photos" : [
    "529baf89d8343e0200000009"
  ],
  "plantCapacity" : 6,
  "reservoirSize" : 4.5,
  "type" : "deep water culture (DWC)",
  "visibility" : "public"
},
{
  "_id" : "506de3008eebf7524342cb3e",
  "name" : "Aquaponics",
  "description" : "Aquaponics is a combination of fish and plant farming.",
  "type" : "aquaponics",
  "visibility" : "public",
  "photos" : [
    "529baf93d8343e020000000a"
  ]
},
{
  "_id" : "506de2ff8eebf7524342cb3c",
  "description" : "A drip system is on where a water pump connected to drip emitters periodically water each plant.",
  "name" : "Drip",
  "photos" : [
    "529baf9dd8343e020000000b"
  ],
  "type" : "drip",
  "visibility" : "public"
},
{
  "_id" : "506de3008eebf7524342cb3d",
  "description" : "A flood & drain system is one in which the grow bed is periodically flooded with water from the reservoir, and then allowed to drain back down to the reservoir. The process repeats on a cycle.",
  "name" : "Flood & Drain",
  "photos" : [
    "529bafc2d8343e020000000c"
  ],
  "type" : "flood & drain",
  "visibility" : "public"
},
{
  "_id" : "506de3008eebf7524342cb40",
  "description" : "Seed-starting system made with a plastic egg carton. For full directions on how to make one, visit http://www.bitponics.com/guides/water-culture-system.",
  "name" : "Egg-carton seed starter",
  "photos" : [
    "529bbb21d8343e020000000d"
  ],
  "plantCapacity" : 12,
  "reservoirSize" : 0.1,
  "type" : "deep water culture (DWC)",
  "visibility" : "public"
},
{
  "_id" : "506de3008eebf7524342cb3f",
  "name" : "Deep Water Culture (DWC)",
  "description" : "A water culture system is one in which the plants sit in an aerated nutrient solution. No active water pumping necessary, just an air pump & air stone to keep the water oxygenated.",
  "type" : "deep water culture (DWC)",
  "photos" : [
    "529be10cd1fddb020000000a"
  ],
  "visibility" : "public"
}
];