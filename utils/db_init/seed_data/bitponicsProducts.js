var ObjectIdSchema = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id : '523136676ba12e27c15bc1c9',
			SKU: 'HBIT0000001',
			productType: "hardware",
			name: "Bitponics Base Station V1",
			description: "Bitponics Base Station V1",
			price: 399,
			stock: 40
		},
		{
			_id : '5231366c6ba12e27c15bc1ca',
			SKU: 'WBIT0000001',
			productType: "webservice",
			name: "Bitponics Free",
			description: "Free Web Service Plan",
			price: 0,
			stock: -1
		},
		{
			_id : '5231366e6ba12e27c15bc1cb',
			SKU: 'WBIT0000002',
			productType: "webservice",
			name: "Bitponics Serious Grower",
			description: "Serious Grower Web Service Plan",
			price: 9,
			stock: -1
		},
		{
			_id : '5231366e6ba12e27c15bc1cc',
			SKU: 'WBIT0000003',
			productType: "webservice",
			name: "Bitponics Commercial Grower",
			description: "Commercial Web Service Plan",
			price: 9,
			stock: -1
		}
	];