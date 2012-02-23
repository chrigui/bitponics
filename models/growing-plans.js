var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var GrowingPlan = new Schema({
  id: ObjectId
});

exports.model = mongoose.model('GrowingPlan', GrowingPlan);