module.exports = {
	urls : {
		local : 'mongodb://admin:1SHar3db1t@ds033097.mongolab.com:33097/bitponics-local',
		development : 'mongodb://admin:1SHar3db1t@ds037597.mongolab.com:37597/bitponics-development',
		staging : 'mongodb://admin:1SHar3db1t@ds037617.mongolab.com:37617/bitponics-staging',
	  	//production : 'mongodb://admin%40bitponics.com:1SHar3db1t@ds041507-a0.mongolab.com:41507,ds041507-spare.mongolab.com:41507/bitponics-prod',
	  	production : 'mongodb://admin:1SHar3db1t@ds037617.mongolab.com:37617/bitponics-staging',
	  	test : 'mongodb://localhost/bitponics-test'
	}
};