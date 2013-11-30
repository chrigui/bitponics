var configuredMixpanel = require('mixpanel').init(require('../config/mixpanel-config').token);

module.exports = configuredMixpanel;