module.exports = function(app){
	require('./growPlan')(app);
	require('./phase')(app);
	require('./idealRange')(app);
};