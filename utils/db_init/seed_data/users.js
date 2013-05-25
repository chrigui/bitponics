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
		}
	];