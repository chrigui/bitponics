var configuredMixpanel;

module.exports = function(app){

  if ( (!configuredMixpanel) && app) {
    configuredMixpanel = require('mixpanel').init(require('../config/mixpanel-config')(app));
  }

  return configuredMixpanel;
};