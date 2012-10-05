var ObjectId = mongoose = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id : '506de2fe8eebf7524342cb34',
			deviceId: "0006667211cf", //mac address
			deviceType: "506de2fe8eebf7524342cb37",
			name : "Bitponics Device 1",
			users : [
				"506de3098eebf7524342cb66", 
				"506de3098eebf7524342cb67",
				"506de30a8eebf7524342cb6c",
				"506de3098eebf7524342cb68",
				"506de30a8eebf7524342cb69",
				"506de30a8eebf7524342cb6a",
				"506de30a8eebf7524342cb6b"
			 ],
			owner: "506de3098eebf7524342cb66",
			controlMap : [ 
			  {
			    control : "506de2fd8eebf7524342cb32",
			    outputId : "1"
			  },
			  {
			    control : "506de2fc8eebf7524342cb2d",
			    outputId : "2"
			  }
			],
			activeGrowPlanInstance: "506de2fe8eebf7524342cb38",
			recentSensorLogs : [
				{
					ts: 1347364818821,
					logs : [
						{
							sCode: "vis",
							value: 12121
						},
						{
							sCode: "vis",
							value: 122222112
						}
					]
				}
			]
		},
		{
			_id : '506de2fe8eebf7524342cb35',
			deviceId: "0006667288ae", //mac address
			deviceType: "506de2fe8eebf7524342cb37",
			name : "Bitponics Device 2",
			users : [
				"506de30a8eebf7524342cb6c"
			 ],
			owner: "506de30a8eebf7524342cb6c",
			controlMap : [ 
			  {
			    control : "506de2fd8eebf7524342cb32",
			    outputId : "1"
			  },
			  {
			    control : "506de2fc8eebf7524342cb2d",
			    outputId : "2"
			  }
			],
			activeGrowPlanInstance: "506de2ff8eebf7524342cb39",
			recentSensorLogs : [
				{
					ts: 1347364818821,
					logs : [
						{
							sCode: "vis",
							value: 12121
						},
						{
							sCode: "vis",
							value: 122222112
						}
					]
				}
			]
		},
		{
			_id : '506de2fe8eebf7524342cb36',
			deviceId: "0006668033ae", //mac address
			deviceType: "506de2fe8eebf7524342cb37",
			name : "Bitponics Device 3",
			users : [
				"506de3098eebf7524342cb66", 
				"506de3098eebf7524342cb67",
				"506de30a8eebf7524342cb6c",
				"506de3098eebf7524342cb68",
				"506de30a8eebf7524342cb69",
				"506de30a8eebf7524342cb6a",
				"506de30a8eebf7524342cb6b"
			 ],
			owner: "506de3098eebf7524342cb68",
			controlMap : [ 
			  {
			    control : "506de2fd8eebf7524342cb32",
			    outputId : "1"
			  },
			  {
			    control : "506de2fc8eebf7524342cb2d",
			    outputId : "2"
			  }
			],
			recentSensorLogs : [
				{
					ts: 1347364818821,
					logs : [
						{
							sCode: "vis",
							value: 12121
						},
						{
							sCode: "vis",
							value: 122222112
						}
					]
				}
			]

		}
	];