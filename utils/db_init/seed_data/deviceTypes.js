module.exports = [
		{
			name: "Bitponics Beta Device 1",
			firmwareVersion: "0.1",
			microprocessor: "blah",
			sensorMap: [
				{ 
					inputId: "ph",
					sensor: "savedObjectIds['sensors']['ph']" // ref to pH Sensor instance"s ObjectId
				},
				{	inputId: "ec",
					sensor:	"savedObjectIds['sensors']['ec']"
				},
				{
					inputId: "tds",
					sensor: "savedObjectIds['sensors']['tds']"
				},
				{
					inputId: "sal",
					sensor: "savedObjectIds['sensors']['sal']"
				},
				{
					inputId: "air",
					sensor: "savedObjectIds['sensors']['air']"
				},
				{
					inputId: "water",
					sensor: "savedObjectIds['sensors']['water']"
				},
				{
					inputId: "hum",
					sensor: "savedObjectIds['sensors']['hum']"
				},
				{
					inputId: "co2",
					sensor: "savedObjectIds['sensors']['co2']"
				},
				{
					inputId: "lux",
					sensor: "savedObjectIds['sensors']['lux']"
				},
				{
					inputId: "ir",
					sensor: "savedObjectIds['sensors']['ir']"
				},
				{	
					inputId: "full",
					sensor: "savedObjectIds['sensors']['full']"
				},
				{
					inputId: "vis",
					sensor: "savedObjectIds['sensors']['vis']"
				}
			],
			controlMap : [
				{
					outputId: "1",
					sensor: "savedObjectIds['controls']['Light']"
				},
				{
					outputId: "2",
					sensor: "savedObjectIds['controls']['Water Pump']"
				}
			]
		},
	];