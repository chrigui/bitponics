/**
 * Must first be require()'ed as a function, passing in the environment.
 * Subsequent requires can simply call require('mongo-connection').defaultConnection
 */

var mongoose = require('mongoose'),
		winston = require('winston');

var self = {
	
	/**
	 * Collection of valid URLs, keyed by environment
	 */
	urls : {
		//local : 'mongodb://admin:1SHar3db1t@ds033097.mongolab.com:33097/bitponics-local',
		local : 'mongodb://localhost/bitponics-local',
		development : 'mongodb://admin:1SHar3db1t@ds037597.mongolab.com:37597/bitponics-development',
		staging : 'mongodb://admin:1SHar3db1t@ds037617.mongolab.com:37617/bitponics-staging',
  	production : 'mongodb://admin%40bitponics.com:1SHar3db1t@ds041507-a0.mongolab.com:41507,ds041507-spare.mongolab.com:41507/bitponics-prod',
  	//production : 'mongodb://admin:1SHar3db1t@ds037617.mongolab.com:37617/bitponics-staging',
  	test : 'mongodb://localhost/bitponics-test',
  	localLocal : 'mongodb://localhost/bitponics-local'
	},

	defaultConnection : undefined,

	connections : {},

	connectionOptions : {
		server : {
      auto_reconnect : true,
      socketOptions : {
          keepAlive : 1
      }
    },
    replset : {
      auto_reconnect : true,
      socketOptions : {
          keepAlive : 1
      }
    }
	},

	open : function(environment, callback){
		
		var connection = self.connections[environment],
				url;
		
		if (connection){
			winston.info("DATABASE RETURNING OPEN CONNECTION TO " + environment);
			if (callback){
				callback(connection);
			}
			return connection;
		}

		url = self.urls[environment] || environment;

		winston.info("DATABASE OPENING CONNECTION TO " + url);

		connection = mongoose.createConnection(
			url, 
			self.connectionOptions,
			function(){
				if (callback){
					callback(connection);
				}
			}
		);

		// mongoose internally queues up DB commands before a connection is opened, so we don't 
		// need to wait for the callback to set these properties and make them available
		if (!self.defaultConnection) {
			self.defaultConnection = connection;
		}

		self.connections[environment] = connection;

		return connection;
	}
};

module.exports = self;