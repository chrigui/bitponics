module.exports = function(app){
	require('./action')(app);
	require('./control')(app);
	require('./device')(app);
	require('./growPlan')(app);
	require('./growPlanInstance')(app);
	require('./growSystem')(app);
	require('./idealRange')(app);
	require('./light')(app);
	require('./nutrient')(app);
	require('./phase')(app);
	require('./sensor')(app);
	require('./user')(app);
};
