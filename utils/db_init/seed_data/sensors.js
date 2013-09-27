var ObjectIdSchema = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id : '506de3068eebf7524342cb59',
			name: "pH",
			abbrev: "pH",
			unit: "pH",
			code: "ph",
			visible : true
		},
		{
			_id : '506de3068eebf7524342cb5a',
			name: "Electrical Conductivity",
			abbrev: "EC",
			unit: "microsiemens", //=> µs
			code: "ec",
			visible : true
		},
		{
			_id : '506de3068eebf7524342cb5b',
			name: "Total Dissolved Solids",
			displayAlias: "Nutrients",
      abbrev: "TDS",
			unit: "parts per million",
			code: "tds",
			visible : false
		},
		{	
			_id : '506de3078eebf7524342cb5c',
			name: "Salinity",
			abbrev: "SAL",
			unit: "percentage",
			code: "sal",
			visible : false
		}, 
		{
			_id : '506de3078eebf7524342cb5d',
			name: "Air Temperature",
			abbrev: "Air Temp",
			unit: "celsius",
			code: "air",
			visible : true
		},
		{
			_id : '506de3078eebf7524342cb5e',
			name: "Water Temperature",
			abbrev: "Water Temp",
			unit: "celsius",
			code: "water",
			visible : true
		},
		{
			_id : '506de3078eebf7524342cb5f',
			name: "Humidity",
			abbrev: "Humidity",
			unit: "percentage",
			code: "hum",
			visible : true
		},
		{
			_id : '506de3088eebf7524342cb60',
			name: "Carbon Dioxide",
			abbrev: "CO2",
			unit: "parts per million",
			code: "co2",
			visible : true
		},
		{
			_id : '506de3088eebf7524342cb61',
			name: "Lux",
			abbrev: "Lux",
			unit: "lm/(m^2)",
			code: "lux",
			visible : false
		},
		{
			_id : '506de3088eebf7524342cb62',
			name: "Infrared",
			abbrev: "IR",
			unit: "Lumens",
			code: "ir",
			visible : false
		},
		{
			_id : '506de3088eebf7524342cb63',
			name: "Lux",
			abbrev: "Lux",
			unit: "lux",
			code: "full",
			visible : true
		},
		{
			_id : '506de3098eebf7524342cb64',
			name: "Visible Light",
			abbrev: "Vis Light",
			unit: "Lumens",
			code: "vis",
			visible : false
		},
		{
			_id : '51b4d9c65dd0f94858bac8ed',
			name: "Water Level",
			abbrev: "Water Level",
			unit: "centimeters",
			code: "wl",
			visible : true
		}
	];