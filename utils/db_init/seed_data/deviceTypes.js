var ObjectIdSchema = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id : '506de2fe8eebf7524342cb37',
			name: "Bitponics Base Station 1",
			firmwareVersion: "0.1",
			microprocessor: "",
			sensorMap: [
				{ 
					inputId: "ph",
					sensor: "506de3068eebf7524342cb59" // ref to pH Sensor instance"s ObjectId
				},
				{	inputId: "ec",
					sensor:	"506de3068eebf7524342cb5a"
				},
				{
					inputId: "air",
					sensor: "506de3078eebf7524342cb5d"
				},
				{
					inputId: "water",
					sensor: "506de3078eebf7524342cb5e"
				},
				{
					inputId: "hum",
					sensor: "506de3078eebf7524342cb5f"
				},
				{
					inputId: "lux",
					sensor: "506de3088eebf7524342cb61"
				},
				{
					inputId: "ir",
					sensor: "506de3088eebf7524342cb62"
				},
				{	
					inputId: "full",
					sensor: "506de3088eebf7524342cb63"
				},
				{
					inputId: "vis",
					sensor: "506de3098eebf7524342cb64"
				}
			],
			controlMap : [
				{
					outputId: "1",
					control: "506de2fd8eebf7524342cb32"
				},
				{
					outputId: "2",
					control: "506de2fc8eebf7524342cb2d"
				}
			]
		}
	];