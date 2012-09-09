module.exports = {
	action: require('./action').model,
	control: require('./control').model,
	device: require('./device').model,
	deviceType: require('./deviceType').model,
	growPlan: require('./growPlan').model,
	growPlanInstance: require('./growPlanInstance').model,
	growSystem: require('./growSystem').model,
	idealRange: require('./idealRange').model,
	light: require('./light').model,
	nutrient: require('./nutrient').model,
	phase: require('./phase').model,
	sensor: require('./sensor').model,
	user: require('./user').model
};