var ObjectIdSchema = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id: "0006667211cf", //mac address
			serial: "AA-301-AAAA",
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
			owner: "506de30a8eebf7524342cb6c",
			outputMap : [ 
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
					l : [
						{
							s: "vis",
							v: 122222112
						}
					]
				}
			]
		},
		{
			//_id : '506de2fe8eebf7524342cb35',
			_id: "0006667288ae", //mac address
			serial: "AA-301-AAAB",
			deviceType: "506de2fe8eebf7524342cb37",
			name : "Bitponics Device 2",
			users : [
				"506de30a8eebf7524342cb6c"
			 ],
			owner: "506de30a8eebf7524342cb6c",
			outputMap : [ 
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
					l : [
						{
							s: "vis",
							v: 122222112
						}
					]
				}
			]
		},
		{
			_id: "0006668033ae", //mac address
			serial: "AA-301-AAAC",
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
			outputMap : [ 
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
					l : [
						{
							s: "vis",
							v: 122222112
						}
					]
				}
			]

		},
		{
			_id: "000666721fc1",
			serial: "AA-301-AAAD",
			deviceType: "506de2fe8eebf7524342cb37",
			name : "Amit's Prototype Bitponics Device 1",
			users : [],
      owner: "506de30a8eebf7524342cb6c",
			outputMap : [ 
			  {
			    control : "506de2fd8eebf7524342cb32",
			    outputId : "1"
			  },
			  {
			    control : "506de2fc8eebf7524342cb2d",
			    outputId : "2"
			  }
			],
			recentSensorLogs : []
		},
    {
      _id: "000666722947", //mac address
      serial: "AA-301-AAAE",
      deviceType: "506de2fe8eebf7524342cb37",
      name : "Michael's Prototype Bitponics Device 2",
      owner: "506de3098eebf7524342cb68",
      users : [],
      activeGrowPlanInstance: "513fee362bc4e204932a467a",
      outputMap : [ 
        {
          control : "506de2fd8eebf7524342cb32",
          outputId : "1"
        },
        {
          control : "506de2fc8eebf7524342cb2d",
          outputId : "2"
        }
      ],
      recentSensorLogs : []
    },
		{
      _id: "000666809ecf",
      serial: "AA-301-AAAF",
      deviceType: "506de2fe8eebf7524342cb37",
      name : "Chris's Prototype Bitponics Device 1",
      users : [],
      owner: "506de3098eebf7524342cb67", // Chris P
      outputMap : [ 
        {
          control : "506de2fd8eebf7524342cb32",
          outputId : "1"
        },
        {
          control : "506de2fc8eebf7524342cb2d",
          outputId : "2"
        }
      ],
      recentSensorLogs : []
    }, 
    {
			_id: "000666809da0", //mac address
			deviceType: "506de2fe8eebf7524342cb37",
			serial: "AA-301-AAAG",
			name : "Michael's device added on 2013-05-10"
		},
		{
			_id: "000666809f5b", //mac address
			deviceType: "506de2fe8eebf7524342cb37",
			serial: "WD-301-HYAT",
			name : "Hyatt Device"
		},
		{
			_id: "000666809f61", //mac address
			deviceType: "506de2fe8eebf7524342cb37",
			serial: "AA-301-AAAH",
			name : "Development Device 2013-05-26"
		},
		{
			_id : "000666809f76",
			deviceType: "506de2fe8eebf7524342cb37",
			serial: "WD-301-JPZF",
			name : "Development Device 2013-06-13"
		},
		{
			_id : "000666809ea6",
			deviceType: "506de2fe8eebf7524342cb37",
			serial: "WD-301-8CIP",
			name : "Amit's Device 2013-06-26"
		},
		{
			_id : "000666809ef6",
			deviceType: "506de2fe8eebf7524342cb37",
			serial: "WD-301-TPRP",
			name : "Jack's Very First Bitponics Device"
		},
		{
			_id : "000666809d8c",
			deviceType: "506de2fe8eebf7524342cb37",
			serial: "WD-301-YJ3S",
			name : "PSFK Apartment Device"
		},
		{
			_id : "000666809d3f",
			deviceType: "506de2fe8eebf7524342cb37",
			serial: "WD-301-1PQE",
			name : "PSFK Window Device"
			
		}
	];