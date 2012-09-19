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
			// sensorMap : [
		 //      { 
			//     sensor : { type: ObjectId, ref: 'Sensor' },
			//     inputId : { type: String }
			//   }
			// ],
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
		// ,
		// {
		// 	deviceId : "00:06:66:72:11:cf",
		// 	owner :,
		// 	name : "Chris' Bitponics Device 2",
		// 	controlMap : [ ],
		// 	sensors : [
		// 		ObjectId("503a79426d25620000000001")
		// 	],
		// 	users : [
		// 		ObjectId("5021e2cd8330ec0000000010")
		// 	]
		// }
	];