var env = process.env.NODE_ENV || 'development',
    assets = {
    "js": {
      "jquery": {
        "dev": "/assets/js/jquery/1.6.2/jquery.min.js",
        "prod": "//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"
      },
      "jqueryui": {
        "dev": "/assets/js/jqueryui/1.8.14/jquery-ui.min.js",
        "prod": "//ajax.googleapis.com/ajax/libs/jqueryui/1.8.14/jquery-ui.min.js"
      },
      "typekit": {
        "dev": "/assets/js/typekit/typekit.js",
        "prod": "//use.typekit.com/efa8gnd.js"
      }
    },
    "css": {
      "reset": {
        "dev": "/assets/css/yui3/reset-min.css",
        "prod": "//yui.yahooapis.com/3.3.0/build/cssreset/reset-min.css"
      },
      "jqueryui": {
        "dev": "/assets/css/jqueryui/jquery-ui.css",
        "prod": "//ajax.googleapis.com/ajax/libs/jqueryui/1.8.1/themes/ui-lightness/jquery-ui.css"
      }
    }
  },
  mongo = { 
    "hostname": "localhost",
    "port": 27017,
    "username": "", 
    "password": "",
    "name": "",
    "db":"bitponics"
  };

var generate_mongo_url = function(obj){
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'test');
  console.log('mongodb db is:' + obj.db);

  if(obj.username && obj.password){
    return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
  } else{
    return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
}

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {
  var //PORT = process.env.VCAP_APP_PORT || 8080,
      //HOST = process.env.VCAP_APP_HOST || '0.0.0.0',

      // TEMP: on local machine, routing bitponics.com to localhost in order to have external oauth's (goog, fb) route back without complaining 
      PORT = 80, // run node as sudo to use port 80
      HOST = 'bitponics.com', // update host file with the line "127.0.0.1 bitponics.com"

      ENV = process.env.NODE_ENV || 'development',
      appUrl = 'http://' + HOST + ':' + PORT;

  app.config = {
    assets : assets,
    auth : require('./auth-config'),
    css : require('./css-config'),
    env : env,
    appUrl : appUrl,
    host : HOST,
    js : require('./js-config'),
    mongoUrl : generate_mongo_url(mongo),
    port : PORT
  };
};

