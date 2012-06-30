var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId,
  GrowSystemSchema = require('./GrowSystem').schema;

var GrowPlanSchema = new Schema({
	title: { type: String, required: true },
	growSystem: { type: ObjectId, ref: 'GrowSystem' }
	//hydro_system_type: { type : ObjectId, ref : 'GrowSystem'},
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
},
{ strict: true });

GrowPlanSchema.plugin(useTimestamps);

exports.model = mongoose.model('GrowPlan', GrowPlanSchema);
