var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId,
  GrowingPlan = require('./growing-plan');

var User = new Schema({
  id: ObjectId,
  growing_plan: [GrowingPlan]
});

exports.model = mongoose.model('User', User);