var routeUtils = require('../route-utils');

module.exports = function(app){
	require('./action')(app);
	require('./control')(app);
	require('./device')(app);
	//TODO require('./deviceType')(app);
	require('./growPlan')(app);
	require('./growPlanInstance')(app);
	require('./growSystem')(app);
	require('./light')(app);
  require('./lightBulb')(app);
	require('./lightFixture')(app);
	require('./nutrient')(app);
	require('./sensor')(app);
	require('./sensorLog')(app);
	require('./user')(app);
};
