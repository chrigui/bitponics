var ObjectIdSchema = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id: 'BPN_HARDWARE_BASE-STATION_1',
			productType: "hardware",
			name: "Bitponics Base Station V1",
			description: "Bitponics Base Station V1",
			price: 399,
			stock: 40,
      TIC: "00000"
		},
    {
      _id: 'BPN_ACC_EC-PROBE',
      productType: "accessory",
      name: "Bitponics Nutrient Probe",
      description: "Nutrient Probe for the Base Station V1",
      price: 99,
      stock: 40,
      TIC: "00000"
    },
		{
			_id: 'BPN_WEB_FREE',
			productType: "service-plan",
			name: "Bitponics Free",
			description: "Free Web Service Plan",
			price: 0,
			stock: undefined,
      TIC: "30070"
		},
		{
			_id: 'BPN_WEB_PREMIUM_MONTHLY',
			productType: "service-plan",
			name: "Bitponics Serious Grower",
			description: "Monthly Serious Grower Web Service Plan",
			price: 9,
      billingCycle : {
        duration: 1,
        durationType : "months"
      },
			stock: undefined,
      TIC: "30070"
		},
		{
			_id: 'BPN_WEB_ENTERPRISE_MONTHLY',
			productType: "service-plan",
			name: "Bitponics Commercial Grower",
			description: "Monthly Commercial Web Service Plan",
			price: 49,
      billingCycle : {
        duration: 1,
        durationType : "months"
      },
			stock: undefined,
      TIC: "30070"
		}
	];