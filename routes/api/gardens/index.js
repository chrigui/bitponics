module.exports = function(app){
	require('./gardens')(app);
  require('./immediate-actions')(app);
  require('./notifications')(app);
	require('./photos')(app);
  require('./sensor-logs')(app);
	require('./text-logs')(app);
};