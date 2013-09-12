var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	mongoosePlugins = require('../../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	ObjectIdSchema = Schema.ObjectId,
  	mongooseConnection = require('../../config/mongoose-connection').defaultConnection;

var ProductSchema = new Schema({
	SKU: { type: String, required: true },
	productType: { type: String, required: true },
	name: { type: String, required: true },
	description: { type: String, required: true },
	price: { type: Number, required: true },
	stock: { type: Number, required: true }
});

ProductSchema.plugin(useTimestamps);

exports.schema = ProductSchema;
exports.model = mongooseConnection.model('BitponicsProduct', ProductSchema);