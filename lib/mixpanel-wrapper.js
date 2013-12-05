var mixpanel;

module.exports = {
  init : function(app){

    if ( (!mixpanel) && app) {
      mixpanel = require('mixpanel').init(require('../config/mixpanel-config')(app));
    }

    return mixpanel;
  },

  track : function(user, eventName, props){
    var properties = {};

    if (props){
      Object.keys(props).forEach(function(key){
        properties[key] = props[key];
      });
    }

    if (user){
      properties["distinct_id"] = user._id.toString();  
    }

    mixpanel.track(eventName, properties);
  },

  increment : function(user, numericProperty){
    mixpanel.people.increment(user._id.toString(), numericProperty);
  }
};