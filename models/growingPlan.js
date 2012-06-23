var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId,
  HydroSystem = require('./HydroSystem').schema;

var GrowingPlan = new Schema({
	id: ObjectId,
	title: { type: String, required: true },
	hydro_system_type: [HydroSystem],
	//hydro_system_type: { type : ObjectId, ref : 'HydroSystem'},
	/*description: { type: String, required: true },    
	tags: { type: String },
	star_rating_average: { type: String },
	users_who_rated_stars: { type: Array },
	expertise level: { type: String },
	users_who_rated_expertise: { type: Array },
	hydro_system_type_of: { type: String },
	lighting_type: { type: String },
	number_of_plants: { type: String },
	growing_medium: { type: String },
	reservoir_size: { type: String },
	nutrients: { type: Array },
	sensor_list: { type: Array }, 
	phases: { type: Array }*/
	modified: { type: Date, default: Date.now }
});

exports.model = mongoose.model('GrowingPlan', GrowingPlan);
