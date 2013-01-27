var ObjectId = mongoose = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id : '506de2fe8eebf7524342cb38',
			users : [
				"506de30a8eebf7524342cb6c"//,
				//"506de3098eebf7524342cb66",
				//"506de3098eebf7524342cb67",
				//"506de3098eebf7524342cb68",
				//"506de30a8eebf7524342cb69",
				//"506de30a8eebf7524342cb6a",
				//"506de30a8eebf7524342cb6b"
			],
			owner : "506de30a8eebf7524342cb6c",
			growPlan : "506de2ff8eebf7524342cb3a",
			device : "506de2fe8eebf7524342cb34", 
			active: true,
		},
		{
			_id : '506de2ff8eebf7524342cb39',
			users : [
				"506de3098eebf7524342cb66"
			],
			owner : "506de3098eebf7524342cb66",
			growPlan : "506de2ff8eebf7524342cb3b",
			active: false
		},
		{
			_id : '50e48ebe71acd87507edef50',
			users : [
				"50e33086a47897af3446e26e"
			],
			owner : "50e33086a47897af3446e26e",
			growPlan : "506de2ff8eebf7524342cb3b",
			active: true
		}
	];