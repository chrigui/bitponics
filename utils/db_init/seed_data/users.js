var ObjectIdSchema = require('mongoose').Schema.ObjectId;

module.exports = [ //default pw is "8bitpass" for all init users
		{
			_id : '506de3098eebf7524342cb65',
			email : "jack.bishop1@gmail.com",
		  	name : {
		  		first : "Jack",
		  		last : "Bishop"
	  		},
		  	locale: "en_US",
		  	active : true,
		  	admin :  true,
		  	activationToken : "1234567890",
		  	sentEmail : false
		},
		{
			_id : '50e33086a47897af3446e26e',
			email : "test@bitponics.com",
		  	name : {
		  		first : "Tfirst",
		  		last : "Tlast"
	  		},
		  	locale: "en_US",
		  	active : true,
		  	admin :  false,
		  	activationToken : "12345678900",
		  	sentEmail : true
		},
		{
			_id : '506de3098eebf7524342cb66',
			email : "jack@bitponics.com",
		  	name : {
		  		first : "Jack",
		  		last : "Bishop"
	  		},
		  	locale: "en_US",
		  	active : true,
		  	admin :  true,
		  	activationToken : "12345678900",
		  	sentEmail : true
		},
		{
			_id : '506de3098eebf7524342cb67',
			email : "chris@bitponics.com",
		  	name : {
		  		first : "Chris",
		  		last : "Piuggi"
	  		},
		  	locale: "en_US",
		  	active : true,
		  	admin :  true,
		  	activationToken : "12345678900",
		  	sentEmail : true,
		  	deviceKey : {
		  		"public" : "a5834ada441a1c88",
		  		"private" : "e16b30b49b9a19aa",
		  	}
		},
		{
			_id : '506de3098eebf7524342cb68',
			email : "michael@bitponics.com",
		  	name : {
		  		first : "Michael",
		  		last : "Doherty"
	  		},
		  	locale: "en_US",
		  	active : true,
		  	admin :  true,
		  	activationToken : "12345678900",
		  	sentEmail : true/*,
		  	"deviceKeys": [{
		        "deviceId" : "000666809da0",
		        "serial" : "AA-301-AAAG",
            "public": "2b8aa505151c9284",
		        "private": "38f93d2b174f0fd7",
		        "verified": true,
		    }]*/
		},
		{
			_id : '506de30a8eebf7524342cb69',
			email : "ac@collectiveassembly.com",
		  	name : {
		  		first : "Andrew",
		  		last : "Chee"
	  		},
		  	locale: "en_US",
		  	active : true,
		  	admin :  true,
		  	activationToken : "12345678900",
		  	sentEmail : true
		},
		{
			_id : '506de30a8eebf7524342cb6a',
			email : "md@collectiveassembly.com",
		  	name : {
		  		first : "Manuel",
		  		last : "Dilone"
	  		},
		  	locale: "en_US",
		  	active : true,
		  	admin :  true,
		  	activationToken : "12345678900",
		  	sentEmail : true
		},
		{
			_id : '506de30a8eebf7524342cb6b',
			email : "vs@collectiveassembly.com",
		  	name : {
		  		first : "Virgilio",
		  		last : "Santos"
	  		},
		  	locale: "en_US",
		  	active : true,
		  	admin :  true,
		  	activationToken : "12345678900",
		  	sentEmail : true
		},
		{
			_id : '506de30a8eebf7524342cb6c',
			email : "amit@bitponics.com",
		  	name: {
		  		first: "Amit",
		  		last: "Kumar"
		  	},
		  	locale: "en_US",
		  	phone : "13104908091",
		  	address : {
		  		line1 : "160 South 3rd St, Apt 15",
		  		city : "Brooklyn",
		  		state : "NY",
		  		zip : "11211",
		  		country : "United States"
		  	},
		  	active : true,
		  	admin :  true,
		  	activationToken : "12345678900",
		  	sentEmail : true,
		  	"apiKey": {
		        "public": "8f67dbb482f720a2",
		        "private": "7f163018dae9b388170c2c2d5d7bad01"
		    },
		    "deviceKeys": [{
		        "deviceId" : "0006667211cf",
		        "serial" : "AA-301-AAAA",
            "public": "dedf72f732cd6f66",
		        "private": "7f27ad4bf71ae693",
		        "verified": true,
		    }]
		},
		{
			_id : "51ac0117a3b04db08057e04a",
			email : "anderson.foote@hyatt.com",
			name : {
				first : "Anderson",
				last : "Foote"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51d91a1af194be26b4e2da4c",
			email : "catherine.kearney@hyatt.com",
			name : {
				first : "Cathy",
				last : "Kearney"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51b382c75dd0f94858bac8ec",
			email : "demo@bitponics.com",
			name : {
				first : "Bitponics",
				last : "Demo"
			},
			password : "bitponics_demo",
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4bf6b21df1a6a836b52",
			email : "william.appiah@hyatt.com",
			name : {
				first : "William",
				last : "Appiah"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c16b21df1a6a836b53",
			email : "benhur.caleja@hyatt.com",
			name : {
				first : "Benhur",
				last : "Caleja"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c16b21df1a6a836b54",
			email : "jacqueline.cobos@hyatt.com",
			name : {
				first : "Jacqueline",
				last : "Cobos"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c16b21df1a6a836b55",
			email : "benjamin.curtis@hyatt.com",
			name : {
				first : "Benjamin",
				last : "Curtis"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c16b21df1a6a836b56",
			email : "frank.edmond@hyatt.com",
			name : {
				first : "Frank",
				last : "Edmond"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c26b21df1a6a836b57",
			email : "mario.esidro@hyatt.com",
			name : {
				first : "Mario",
				last : "Esidro"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c26b21df1a6a836b58",
			email : "sandra.gomez@hyatt.com",
			name : {
				first : "Sandra",
				last : "Gomez"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c26b21df1a6a836b59",
			email : "giancarlo.matos@hyatt.com",
			name : {
				first : "Giancarlo",
				last : "Matos"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c66b21df1a6a836b5a",
			email : "mick.mellon@hyatt.com",
			name : {
				first : "Mick",
				last : "Mellon"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c76b21df1a6a836b5b",
			email : "ana.rosario@hyatt.com",
			name : {
				first : "Ana",
				last : "Rosario"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c76b21df1a6a836b5c",
			email : "darlene.santos@hyatt.com",
			name : {
				first : "Darlene",
				last : "Santos"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c76b21df1a6a836b5d",
			email : "liza.terkoski@hyatt.com",
			name : {
				first : "Liza",
				last : "Terkoski"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c86b21df1a6a836b5e",
			email : "shamiesha.williams@hyatt.com",
			name : {
				first : "Shamiesha",
				last : "Williams"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c86b21df1a6a836b5f",
			email : "kenisha.mcintosh@hyatt.com",
			name : {
				first : "Kenisha",
				last : "McIntosh"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c86b21df1a6a836b60",
			email : "tasha.jones@hyatt.com",
			name : {
				first : "Tasha",
				last : "Jones"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c86b21df1a6a836b61",
			email : "afia.maxwell@hyatt.com",
			name : {
				first : "Afia",
				last : "Maxwell"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c96b21df1a6a836b62",
			email : "cinthya.sanchez@hyatt.com",
			name : {
				first : "Cinthya",
				last : "Sanchez"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c96b21df1a6a836b63",
			email : "rasha.sokkar@hyatt.com",
			name : {
				first : "Rasha",
				last : "Sokkar"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4c96b21df1a6a836b64",
			email : "domingo.tavarez@hyatt.com",
			name : {
				first : "Domingo",
				last : "Tavarez"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4ca6b21df1a6a836b65",
			email : "luis.vacca@hyatt.com",
			name : {
				first : "Luis",
				last : "Vacca"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde4ca6b21df1a6a836b66",
			email : "megan.gederian@hyatt.com",
			name : {
				first : "Megan",
				last : "Gederian"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde55a6b21df1a6a836b68",
			email : "yvonne.yip@hyatt.com",
			name : {
				first : "Yvonne",
				last : "Yip"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde55b6b21df1a6a836b69",
			email : "emma.malaki@hyatt.com",
			name : {
				first : "Emma",
				last : "Malaki"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde55b6b21df1a6a836b6a",
			email : "Misty.lindo@hyatt.com",
			name : {
				first : "Misty",
				last : "Lindo"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde55b6b21df1a6a836b6b",
			email : "Bryan.williamson@hyatt.com",
			name : {
				first : "Bryan",
				last : "Williamson"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde55c6b21df1a6a836b6c",
			email : "Karla.levine@hyatt.com",
			name : {
				first : "Karla",
				last : "Levine"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde55c6b21df1a6a836b6d",
			email : "Myra.stith@hyatt.com",
			name : {
				first : "Myra",
				last : "Stith"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde55c6b21df1a6a836b6e",
			email : "yuxi.jimenez@hyatt.com",
			name : {
				first : "Yuxi",
				last : "Jimenez"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde55c6b21df1a6a836b6f",
			email : "betzaida.negron@hyatt.com",
			name : {
				first : "Betzaida",
				last : "Negron"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde55d6b21df1a6a836b70",
			email : "ana.vasquez@hyatt.com",
			name : {
				first : "Ana",
				last : "Vasquez"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde55d6b21df1a6a836b71",
			email : "candace.figueroa@hyatt.com",
			name : {
				first : "Candace",
				last : "Figueroa"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "51fde55d6b21df1a6a836b72",
			email : "delma.simo@hyatt.com",
			name : {
				first : "Delma",
				last : "Simo"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "520312556b21df1a6a836b77",
			email : "endrithajno@gmail.com",
			name : {
				first : "Endrit",
				last : "Hajno"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		},
		{
			_id : "520312566b21df1a6a836b78",
			email : "abigailrcohen@gmail.com",
			name : {
				first : "Abby",
				last : "Cohen"
			},
			active : true,
			locale : "en_US",
			activationToken : "12345678900",
			sentEmail : true
		}
	];