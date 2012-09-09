var loggly = {
      subdomain : 'bitponics',
      tokens : {
        local : 'c8593ee1-8a09-426f-acd6-871b70b91fd0',
        development : '5cc07897-f3f8-46ab-aaa1-888f88ae6683',
        production : '437fee23-8d8a-4171-ab17-7e211c176003'
      }  
    },
    mongo = { 
      "hostname": "localhost",
      "port": 27017,
      "username": "", 
      "password": "",
      "name": "",
      "db":"bitponics"
    },
    generateMongoUrl = function(app){
      /*
      obj.hostname = (obj.hostname || 'localhost');
      obj.port = (obj.port || 27017);
      obj.db = (obj.db || 'test');
      console.log('mongodb db is:' + obj.db);

      if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
      } else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
      }*/
  };

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {
  //var // on local machine, routing bitponics.com to localhost in order to have external oauth's (goog, fb) route back without complaining 
      //PORT = process.env.PORT || 80, // run node as sudo to use port 80
      //HOST = process.env.HOST || 'bitponics.com', // update host file with the line "127.0.0.1 bitponics.com"

  console.log('NODE_ENV ' + process.env.NODE_ENV);

  var mongoUrl = process.env.MONGOLAB_URI,
      appDomain = process.env.BITPONICS_APP_DOMAIN,
      appUrl;

  // TODO: app.settings.env automatically reads from process.env.NODE_ENV & defaults to 'development'.
  //       For some reason, process.env isn't reading my environment's NODE_ENV variable.
  //       Setting it manually for now, but figure out what's going on
  app.settings.env = process.env.NODE_ENV = process.env.NODE_ENV || 'local';

  switch(app.settings.env){
    case 'local':
      appDomain = appDomain || 'bitponics.com';
      mongoUrl = mongoUrl || 'mongodb://admin:1SHar3db1t@ds033097.mongolab.com:33097/bitponics-local';
      break;
    case 'development':
      appDomain = appDomain || 'dev.bitponics.com';
      mongoUrl = mongoUrl || 'mongodb://admin:1SHar3db1t@ds037597.mongolab.com:37597/bitponics-development';  
      break;
    case 'staging':
      appDomain = appDomain || 'staging.bitponics.com';
      mongoUrl =  mongoUrl || 'mongodb://admin:1SHar3db1t@ds037617.mongolab.com:37617/bitponics-staging';
      break;
    case 'production':
      appDomain = appDomain || 'prod.bitponics.com';
      mongoUrl = mongoUrl || 'mongodb://admin:1SHar3db1t@ds037587.mongolab.com:37587/bitponics-production';
      break;
    // no default; app.settings.env defaults to 'development' if process.env.NODE_ENV isn't set
  }

  appUrl = 'http://' + appDomain;

  console.log("ENVIRONMENT VARIABLES");
  console.log(process.env);
      
  app.config = {
    //auth : require('./auth-config'),
    css : require('./css-config'),
    appUrl : appUrl,
    js : require('./js-config'),
    loggly : loggly,
    mongoUrl : mongoUrl
  };

  // locals are passed down to the views
  app.locals({
    title : 'Bitponics',
    appUrl: app.config.appUrl,
    className: undefined
  });

  require('./auth-config')(app);
  require('./app-config')(app);
};

