var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var HydroSystem = new Schema({
	name: { type: String, required: true }
});

exports.schema = HydroSystem;
exports.model = mongoose.model('HydroSystem', HydroSystem);
