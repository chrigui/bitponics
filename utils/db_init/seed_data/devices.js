module.exports = [
		{
			deviceId: "0006667211cf", //mac address
			deviceType: "savedObjectIds['deviceTypes']['Bitponics Beta Device 1']",
			name : "Bitponics Device 1",
			users : [
				"savedObjectIds['users']['jack@bitponics.com']", 
				"savedObjectIds['users']['chris@bitponics.com']",
				"savedObjectIds['users']['amit@bitponics.com']",
				"savedObjectIds['users']['michael@bitponics.com']"
			 ],
			owner: "savedObjectIds['users']['jack@bitponics.com']",
			controlMap : [ 
			  {
			    control : "savedObjectIds['controls']['Light']",
			    outputId : "1"
			  },
			  {
			    control : "savedObjectIds['controls']['Water Pump']",
			    outputId : "2"
			  }
			],
			recentSensorLogs : [
				{
					timestamp: 1347364818821,
					logs : [
						{
							sensor: "savedObjectIds['sensors']['vis']",
							value: 12121
						},
						{
							sensor: "savedObjectIds['sensors']['vis']",
							value: 122222112
						}
					]
				}
			]
		},
		{
			deviceId: "0006667288ae", //mac address
			deviceType: "savedObjectIds['deviceTypes']['Bitponics Beta Device 1']",
			name : "Bitponics Device 2",
			users : [
				"savedObjectIds['users']['amit@bitponics.com']"
			 ],
			owner: "savedObjectIds['users']['amit@bitponics.com']",
			controlMap : [ 
			  {
			    control : "savedObjectIds['controls']['Light']",
			    outputId : "1"
			  },
			  {
			    control : "savedObjectIds['controls']['Water Pump']",
			    outputId : "2"
			  }
			],
			recentSensorLogs : [
				{
					timestamp: 1347364818821,
					logs : [
						{
							sensor: "savedObjectIds['sensors']['vis']",
							value: 12121
						},
						{
							sensor: "savedObjectIds['sensors']['vis']",
							value: 122222112
						}
					]
				}
			]
		}
	];