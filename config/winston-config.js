var winston = require('winston'),
	loggly = {
      subdomain : 'bitponics',
      tokens : {
        local : 'c8593ee1-8a09-426f-acd6-871b70b91fd0',
        development : '5cc07897-f3f8-46ab-aaa1-888f88ae6683',
        staging: 'fed14f46-e08e-43c5-b8c3-526c93c6f5fd',
        production : '437fee23-8d8a-4171-ab17-7e211c176003',
        ci : '2ea038cf-4f59-4f84-b29c-ec418f0ce0e2'
      }  
    };

module.exports = function(){
	winston.cli();
	winston.exitOnError = false;
	  
	return {
		setupLoggly : function(env){
			winston.add(require('winston-loggly').Loggly, {
			    subdomain : loggly.subdomain,
			    inputToken : loggly.tokens[env],
			    level : 'error',
			    handleExceptions: true
			});
		}
	}
};