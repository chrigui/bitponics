/**
 * Orders
 * @module models/Order
 */

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectIdSchema = Schema.ObjectId,
  mongoosePlugins = require('../lib/mongoose-plugins'),
  useTimestamps = mongoosePlugins.useTimestamps,
  winston = require('winston'),
  mongooseConnection = require('../config/mongoose-connection').defaultConnection,
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils'),
  OrderModel;


var OrderItemSchema = new Schema(
  { 
    product : { type : String, ref : "Product", required: true },
    
    quantity : { type : Number, default : 1, required : true },
    
    unitPrice : { type : Number },
    
    shippingHandling : { type : Number, default : 0 },
    
    salesTax : { type : Number },

    total : { type : Number },
    
    fulfillmentStatus : {
      type : String,
      enum : [
        feBeUtils.FULFILLMENT_STATUSES.PENDING,
        feBeUtils.FULFILLMENT_STATUSES.SHIPPED,
        feBeUtils.FULFILLMENT_STATUSES.COMPLETE
      ],
      default : feBeUtils.FULFILLMENT_STATUSES.PENDING
    },


    /**
     * Optional. Exists if this item is a subscription plan
     */
    braintreeSubscriptionId : { type : Object }
  },
  { id : false }
);

OrderItemSchema.plugin(mongoosePlugins.recoverableRemove);

OrderItemSchema.virtual('subtotal')
  .get(function(){
    return this.quantity * this.unitPrice;
  });

OrderItemSchema.method('calculateTotal', function(){
  return (
    (this.quantity * this.unitPrice) +
    (this.shippingHandling || 0) + 
    (this.tax || 0)
  );
});



var ShipmentSchema = new Schema(
  {
    orderItems : [ { type : ObjectIdSchema } ],
    trackingNumber : { type : String }
  },
  { id : false }
);


var OrderSchema = new Schema(
  {
    
    owner : { type : ObjectIdSchema, ref: "User" },

    
    /**
     * The request session id created when a user first starts entering items
     * into a cart. Used for querying in case a user is not logged in and we
     * don't have an owner on the Order
     */
    sessionId : { type : String, required: false },

    /**
     * Signing up for the free plan still might be entered as an Order, so don't require a payment method
     */
    braintreePaymentMethodToken : { type : String, required: false },


    /** 
     * A Braintree transaction can be submitted after the order is placed (as in the case of preorders), 
     * so we don't necessarily have a transactionId right away.
     *
     * In that case though, we at least need a paymentMethodToken.
     *
     * https://support.braintreepayments.com/customer/portal/articles/1080637
     */
    braintreeTransactionId : { type : ObjectIdSchema, required: false },

    items : [ OrderItemSchema ],

    subtotal : { type : Number },

    shippingHandling : { type : Number },

    salesTax : { type : Number },

    total : { type : Number },

    shippingAddress : {
      firstName: { type : String },
      lastName: { type : String },
      streetAddress: { type : String },
      extendedAddress: { type : String },
      locality: { type : String },
      region: { type : String },
      postalCode: { type : String },
      countryCode : { type : String }
    },


    billingAddress : {
      firstName: { type : String },
      lastName: { type : String },
      streetAddress: { type : String },
      extendedAddress: { type : String },
      locality: { type : String },
      region: { type : String },
      postalCode: { type : String },
      countryCode : { type : String }
    },


    fulfillmentStatus : {
      type : String,
      enum : [
        feBeUtils.FULFILLMENT_STATUSES.PENDING,
        feBeUtils.FULFILLMENT_STATUSES.SHIPPED,
        feBeUtils.FULFILLMENT_STATUSES.COMPLETE
      ],

      default : feBeUtils.FULFILLMENT_STATUSES.PENDING
    },

    status : {
      type : String,
      enum : [
        feBeUtils.ORDER_STATUSES.ACTIVE_CART,
        feBeUtils.ORDER_STATUSES.SUBMITTED,
        feBeUtils.ORDER_STATUSES.PAID,
        feBeUtils.ORDER_STATUSES.COMPLETE
      ],
      default : feBeUtils.ORDER_STATUSES.ACTIVE_CART
    },

    shipments : [ ShipmentSchema ]
  },
  { id : false }
);

OrderSchema.plugin(useTimestamps);


OrderSchema.method('calculateTotal', function(){
  var total = 0;
  this.items.forEach(function(item){
    total += item.total;
  });
  return total;
});


/**
 * Assumes braintree config has been set up with app environment
 * 
 * Assumes all required fields on order and order.items have been populated
 * @param {Object} options. Order properties
 */
OrderSchema.static('create', function(options, callback){
  var braintree = require('braintree'),
    braintreeConfig = require('../config/braintree-config'),
    gateway = braintree.connect(braintreeConfig.braintreeGatewayConfig),
    ProductModel = require('./product').model,
    modelUtils = require('./utils');

  var order = new OrderModel(options);
  
  async.each(
    order.items, 
    function itemIterator(orderItem){
      ProductModel.findById(modelUtils.getDocumentIdString(orderItem.product))
      .exec(function(err, product){
      });
    },
    function itemsComplete(err){
      order.save(function(err, createdOrder){
        // TODO : if status is not ACTIVE_CART, email the owner with status
        console.log("CREATED CART", err, createdOrder)
        return callback(err, createdOrder);
      });
    }
  );
});


/**
 * Advance a shopping cart into a submitted order
 * Decrements stocks of products
 */
OrderSchema.method('submitOrder', function(callback){
  var order = this;

  // TODO : decrement stock counters on products

  order.status = feBeUtils.ORDER_STATUSES.SUBMITTED;

  order.save(callback);
});


OrderSchema.index({ 'user' : 1, 'status' : 1 });
OrderSchema.index({ 'sessionId' : 1, 'status' : 1 });



/**
 * @type {Schema}
 */
exports.schema = OrderSchema;

/**
 * @constructor
 * @alias module:models/Order.OrderModel
 * @type {Model}
 */
exports.model = OrderModel = mongooseConnection.model('Order', OrderSchema);