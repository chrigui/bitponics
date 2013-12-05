module.exports = function(app){
	var token;

  switch(app.settings.env){
    case 'production':
      token = "8ed0428033d1a2c863ab2566595fcac4";
      break;
    default:
      // else, we want to use the token for the "Bitponics-dev" mixpanel
      token = "67fe5c8aad13aecd68aac5bc802faee3";
  }

  // Expose mixpanel token to views
  app.locals({ mixpanelToken: token });

  return token;
};