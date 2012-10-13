/**
 * Config objects to be passed to nodeMailer.createTransport
 */

module.exports = {
	accounts : {
	    service: "Gmail",
	    auth: {
	        user: "accounts@bitponics.com",
	        pass: "8bitpass"
	    }
	},
	notifications : {
		service: "Gmail",
	    auth: {
	        user: "notifications@bitponics.com",
	        pass: "notb1tp@ss"
	    }
	},
	amazonSES: {
		smtp : {
			service : "SES",
			auth : {
				"user" : "AKIAJGJU25OKR4LTLH6A",
				"pass" : "Ag0f1LZ7nsJ6Hhkhq7e1rQTZpGkQCpwaFfWeAdfnYrpG"	
			}
		},
		api : {
			"AWSAccessKeyID" : "AKIAIU5OC3NSS5DGS4RQ",
			"AWSSecretKey" : "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"			
		}
	}
};