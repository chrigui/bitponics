var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
	Schema = mongoose.Schema,
	mongoosePlugins = require('../../lib/mongoose-plugins'),
	useTimestamps = mongoosePlugins.useTimestamps,
	ObjectIdSchema = Schema.ObjectId,
	mongooseConnection = require('../../config/mongoose-connection').defaultConnection,
  requirejs = require('../../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils');

var ProductSchema = new Schema({
	
  /**
   * id is the SKU. 
   * Format is described here: https://docs.google.com/a/bitponics.com/document/d/1an8-VvC2KWxB1eM5RTARXkVtClsu93yaQcX66M643Fw/edit#
   */
  _id: { type: String },
	
  productType: { 
    type: String, 
    required: true,
    enum: [
      feBeUtils.PRODUCT_TYPES.ACCESSORY,
      feBeUtils.PRODUCT_TYPES.HARDWARE,
      feBeUtils.PRODUCT_TYPES.SERVICE_PLAN
    ]
  },
	
  name: { type: String, required: true },
	
  description: { type: String, required: true },
	
  price: { type: Number, required: true },

  /**
   * Optional. Only applies when productType == feBeUtils.PRODUCT_TYPES.SERVICE_PLAN
   */
  billingCycle : {
    duration : { type : Number },
    durationType : { type : String, enum : ["months", "years"] }
  },
	
  /**
   * If undefined, infinite.
   */
  stock: { type: Number, required: false },

  /**
   * In kg
   */
  shippingWeight : { type : Number, required: false },


  /**
   * Taxability Information Code
   * https://taxcloud.net/tic/default.aspx
   */
  TIC : { type : String, default : "00000" }

});

ProductSchema.plugin(useTimestamps);

exports.schema = ProductSchema;
exports.model = mongooseConnection.model('Product', ProductSchema);