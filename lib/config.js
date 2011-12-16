var assets = {
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
  };
var jsConfig = require('./js-config')
	, cssConfig  = require('./css-config');

exports.configure = function(app) {
	configure(app);
}

function configure(app) {

}
