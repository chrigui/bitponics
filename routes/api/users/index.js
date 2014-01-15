module.exports = function(app){
	require('./users')(app);
  require('./notifications')(app);
};