var winston = require('winston'),
    winstonConfig = require('./winston-config')(),
    mongoConfig = require('./mongo-config'),
    appDomains = require('./app-domain-config'),
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

  winston.info('NODE_ENV ');

  var mongoUrl = process.env.MONGOLAB_URI,
      mongoUrls = mongoConfig.urls,
      appDomain = process.env.BITPONICS_APP_DOMAIN,
      appUrl;

  // TODO: app.settings.env automatically reads from process.env.NODE_ENV & defaults to 'development'.
  //       For some reason, process.env isn't reading my environment's NODE_ENV variable.
  //       Setting it manually for now, but figure out what's going on
  app.settings.env = process.env.NODE_ENV = process.env.NODE_ENV || 'local';

  winstonConfig.setupLoggly(app.settings.env);

  winston.info(app.settings.env);
  
  appDomain = appDomain || appDomains[app.settings.env];
  mongoUrl = mongoUrl || mongoUrls[app.settings.env];
  
  appUrl = 'http://' + appDomain;

  winston.info("ENVIRONMENT VARIABLES");
  winston.info(JSON.stringify(process.env));
      
  app.config = {
    //auth : require('./auth-config'),
    css : require('./css-config'),
    appUrl : appUrl,
    js : require('./js-config'),
    mongoUrl : mongoUrl
  };

  require('../models/user').setVerificationEmailDomain(appDomain);

  // locals are passed down to the views
  app.locals({
    title : 'Bitponics',
    appUrl: app.config.appUrl,
    className: undefined
  });

  require('./auth-config')(app);
  require('./app-config')(app);
};

