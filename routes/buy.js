var async = require('async'),
	winston = require('winston'),
	routeUtils = require('./route-utils'),
	braintree = require('braintree'),
  async = require('async'),
	OrderModel = require('../models/order').model,
  ProductModel = require('../models/product').model,
  UserModel = require('../models/user').model,
	requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils'),
  error = require('../lib/error'),
  baseStationProductId = feBeUtils.PRODUCT_IDS['BPN_HARDWARE_BASE-STATION_1'];
	

module.exports = function(app){
	var braintreeConfig = require('../config/braintree-config'),
		gateway = braintree.connect(braintreeConfig.braintreeGatewayConfig);

	
  /**
	 * Order Landing Page
	 * 
	 */
	app.get('/buy',
		routeUtils.middleware.ensureSecure, 
		function (req, res, next) {
			var locals = {
					title: 'Buy - Bitponics',
					className: "landing-page single-page getstarted register buy",
					pageType: "landing-page",
					braintreeClientSideKey: braintreeConfig.braintreeClientSideKey
				};

			res.render('buy', locals);
		}
	);

	
  /**
	 * Checkout Page
	 * 
	 */
	app.get('/buy/checkout',
		routeUtils.middleware.ensureSecure, 
		function (req, res, next) {

      async.waterfall(
        [
          function ensureCart(innerCallback){
            return routeUtils.getCart(req, innerCallback);
          },
        ],

        function waterfallFinal(err, cart){
          if (err) { return next(err); }          
          ProductModel.find()
            .exec(function(err, productResults){
              if (err) { return next(err); }
              var locals = {
                title: 'Checkout - Bitponics',
                className: "landing-page single-page getstarted register buy",
                pageType: "landing-page",
                braintreeClientSideKey: braintreeConfig.braintreeClientSideKey,
                cart : cart,
                bitponicsProducts: {},
                transactionError : null,
                tempUserInfo : null
                //transactionError: req.session.declined ? req.session.declined : null,
                //tempUserInfo: req.session.tempUserInfo ? req.session.tempUserInfo : null
              };

              productResults.forEach(function(product){
                locals.bitponicsProducts[product._id] = product;
              });

              res.render('./buy/checkout', locals);
            }
          );
        }
      );
		}
	);

	
  /**
   * CC info form POST
   * Connects to Braintree to verify CC info
   * Creates customer in Braintree Vault, then does pre-auth since we're only taking pre-orders now
   */
  app.post("/buy/verify-transaction",
    routeUtils.middleware.ensureSecure, 
    function (req, res, next) {
      
      var reqBody = req.body,
          email = reqBody.email ? reqBody.email.toLowerCase() : '',
          user,
          billingAddress = {
            firstName: reqBody.firstName,
            lastName: reqBody.lastName,
            streetAddress: reqBody.streetAddress,
            extendedAddress: reqBody.extendedAddress,
            locality: reqBody.locality,
            region: reqBody.region,
            postalCode: reqBody.postalCode,
            countryCodeAlpha2: reqBody.locale_timezone
          },
          shippingAddress,
          order,
          braintreeCC;
      

      winston.info('verify-transaction POST', reqBody);

      if (reqBody.shippingSameAsBilling) { 
        shippingAddress = billingAddress;
      } else {
        shippingAddress = {
          firstName: reqBody.ship_firstName,
          lastName: reqBody.ship_lastName,
          streetAddress: reqBody.ship_streetAddress,
          extendedAddress: reqBody.ship_extendedAddress,
          locality: reqBody.ship_locality,
          region: reqBody.ship_region,
          postalCode: reqBody.ship_postalCode,
          countryCodeAlpha2: reqBody.ship_locale_timezone
        };
      }

      async.waterfall(
        [
          function ensureUserExists(innerCallback){
            if (req.user && req.user._id){
              user = req.user;
              email = user.email;
              return innerCallback();
            }

            UserModel.findOne({email : email}, function(err, userResult){
              if (err) { return next(err); }
              if (userResult){ 
                user = userResult;
                return innerCallback(); 
              } else {
                UserModel.createUserWithPassword(
                {
                  email : email,
                  name : {
                    first : reqBody.firstName,
                    last : reqBody.lastName
                  },
                  streetAddress: reqBody.streetAddress,
                  extendedAddress: reqBody.extendedAddress,
                  locality: reqBody.locality,
                  region: reqBody.region,
                  postalCode: reqBody.postalCode,
                  countryCodeAlpha2: reqBody.locale_timezone      
                },
                reqBody.password,
                function(err, createdUser){
                  if (err) { return innerCallback(err); }
                  
                  user = createdUser;
                  
                  return innerCallback();
                });
              }
            });
          },
          function ensureBraintreeCustomerExists(innerCallback){
            gateway.customer.find(user._id.toString(), 
              function(err, customer){
                winston.info("ensureBraintreeCustomerExists", err, customer);
                if (err && err.type !== "notFoundError") { return innerCallback(err); }
                
                if (customer) { 
                  return innerCallback(); 
                }
                
                gateway.customer.create({
                  id : user._id.toString(),
                  email: email.toLowerCase(),
                  firstName: reqBody.firstName,
                  lastName: reqBody.lastName
                }, function (err, result) {
                  if (err) { return innerCallback(err); }
                  
                  winston.info("CREATED BRAINTREE CUSTOMER", result.customer);

                  return innerCallback();
                });
              }
            );
          },
          function createBraintreeCreditCard(innerCallback){
            gateway.creditCard.create(
              {
                customerId: user._id.toString(),
                number: reqBody.number,
                cvv: reqBody.cvv,
                expirationMonth: reqBody.month,
                expirationYear: reqBody.year,
                billingAddress: {
                  firstName: reqBody.firstName,
                  lastName: reqBody.lastName,
                  streetAddress: reqBody.streetAddress,
                  extendedAddress: reqBody.extendedAddress,
                  locality: reqBody.locality,
                  region: reqBody.region,
                  postalCode: reqBody.postalCode,
                  countryCodeAlpha2: reqBody.locale_timezone
                }
              }, 
              function (err, result) {
                winston.info("createBraintreeCreditCard", err, result);
                if (err) { return innerCallback(err); }
                if (!result.success){
                  return innerCallback(new error.ValidationError("Credit card failed verification"));
                }
                // Customer, CC, and billing address are now in the vault
                winston.info("CREATED BRAINTREE CC", result);
                braintreeCC = result.creditCard;
                return innerCallback();
              }
            );
          },
          function createShippingAddress(innerCallback){
            if (reqBody.shippingSameAsBilling) { 
              return innerCallback(); 
            }

            shippingAddress.customerId = user._id.toString();

            gateway.address.create(
              shippingAddress,
              function (err, result) {
                if (err) { return innerCallback(err); }
                return innerCallback();
              }
            );
          },
          function placeOrder(innerCallback){
            ProductModel.find()
            .exec(function(err, productResults){
              if (err) { return innerCallback(err); }

              var bitponicsProducts = {};
              productResults.forEach(function(product){
                bitponicsProducts[product._id] = product; 
              });

              var baseStation = bitponicsProducts[feBeUtils.PRODUCT_IDS["BPN_HARDWARE_BASE-STATION_1"]],
                  ecProbe = bitponicsProducts[feBeUtils.PRODUCT_IDS["BPN_ACC_EC-PROBE"]],
                  chosenWebServicePlan;

              
              orderItems = [];

              // Add a device
              orderItems.push({
                product: baseStation._id,
                quantity : 1,
                unitPrice : baseStation.price,
                shippingHandling: (shippingAddress.countryCodeAlpha2 === "US" ? 15 : 50),
                salesTax : 0 // TODO
              });

              // Check whether to add the EC probe
              if (reqBody.ecSensor === 'true'){
                orderItems.push({
                  product: ecProbe._id,
                  quantity : 1,
                  unitPrice : ecProbe.price,
                  shippingHandling: 0,
                  salesTax : 0 // TODO
                });
              }

              // Check which service plan to add
              switch(reqBody.webServicePlan){
                case feBeUtils.PRODUCT_IDS["BPN_WEB_PREMIUM_MONTHLY"]:
                  chosenWebServicePlan = bitponicsProducts[feBeUtils.PRODUCT_IDS["BPN_WEB_PREMIUM_MONTHLY"]];
                  break;

                case feBeUtils.PRODUCT_IDS["BPN_WEB_ENTERPRISE_MONTHLY"]:
                  chosenWebServicePlan = bitponicsProducts[feBeUtils.PRODUCT_IDS["BPN_WEB_ENTERPRISE_MONTHLY"]];
                  break;
                
                default:
                  chosenWebServicePlan = bitponicsProducts[feBeUtils.PRODUCT_IDS["BPN_WEB_FREE"]];
              }

              orderItems.push({
                product: chosenWebServicePlan._id,
                quantity : 1,
                unitPrice : 0, // no immediate charge for service plans; only after activation
                shippingHandling: 0,
                salesTax : 0 // TODO
              });

              winston.info("CREATING ORDER", order);


              routeUtils.getCart(req, function(err, cart){
                cart.owner = user;
                cart.braintreePaymentMethodToken = braintreeCC.token;
                cart.shippingAddress = shippingAddress;
                cart.billingAddress = billingAddress;
                cart.items = orderItems;
                
                cart.submitOrder(innerCallback);
              });
            });
          }
        ],
        function waterfallFinal(err, order){
          if (err){
            if (err.name !== "ValidationError") { return next(err); }
            req.session.checkout = req.session.checkout || {};
            req.session.checkout.validationError = err;
            return res.redirect('/buy/checkout');
          }
          res.redirect('/buy/confirmation?orderId=' + order._id.toString());
        }
      );
    }
  );


  /**
	 * CC info form POST
	 * Connects to Braintree to verify CC info
	 * Creates customer in Braintree Vault, then does pre-auth since we're only taking pre-orders now
	 */
   /*
	app.post("/buy/verify-transaction",
		routeUtils.middleware.ensureSecure, 
		function (req, res) {
			var customerRequest = {
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					creditCard: {
						number: req.body.number,
						cvv: req.body.cvv,
						expirationMonth: req.body.month,
						expirationYear: req.body.year,
						billingAddress: {
							postalCode: req.body.postalCode
						}
					}
				},
				saleRequest = {},
				
				// save non-sensitive pertinent info in case of error, back button, etc.
				userInfo = {
					isPreOrder: req.body.isPreOrder,
					baseStationQuantity: req.body.baseStationQuantity,
					webServicePlan: req.body.webServicePlan,
					email: req.body.email,
					personalInfo: {
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						streetAddress: req.body.streetAddress,
						extendedAddress: req.body.extendedAddress,
						locality: req.body.locality,
						region: req.body.region,
						postalCode: req.body.postalCode,
						countryCodeAlpha2: req.body.locale_timezone
					},
					shippingInfo: {
						firstName: req.body.ship_firstName,
						lastName: req.body.ship_lastName,
						streetAddress: req.body.ship_streetAddress,
						extendedAddress: req.body.ship_extendedAddress,
						locality: req.body.ship_locality,
						region: req.body.ship_region,
						postalCode: req.body.ship_postalCode,
						countryCodeAlpha2: req.body.ship_locale_timezone
					},
					shippingSameAsBilling: req.body.shippingSameAsBilling
				},
				totalPriceToAuthorize = req.body.priceTotal.replace(/[^\d.-]/g, '');

			//save user info in session for repopulation if needed
			req.session.tempUserInfo = userInfo;

			saleRequest = {
				amount: totalPriceToAuthorize,
				creditCard: {
					number: req.body.number,
					cvv: req.body.cvv,
					expirationMonth: req.body.month,
					expirationYear: req.body.year
				},
				customer: {
					firstName: req.body.firstName,
					lastName: req.body.lastName,
				},
				billing: {
					streetAddress: req.body.streetAddress,
					extendedAddress: req.body.extendedAddress,
					locality: req.body.locality,
					region: req.body.region,
					postalCode: req.body.postalCode,
					countryCodeAlpha2: req.body.locale_timezone
				},
				options: {
					storeInVault: true,
					addBillingAddressToPaymentMethod: true,
					storeShippingAddressInVault: true,
					submitForSettlement: false
				}
			};

			if (!userInfo.shippingSameAsBilling) {
				saleRequest.shipping = {
					firstName: req.body.ship_firstName,
					lastName: req.body.ship_lastName,
					streetAddress: req.body.ship_streetAddress,
					extendedAddress: req.body.ship_extendedAddress,
					locality: req.body.ship_locality,
					region: req.body.ship_region,
					postalCode: req.body.ship_postalCode,
					countryCodeAlpha2: req.body.ship_locale_timezone
				}
			}

			// TODO: add subscription to web service to saleRequest
			// https://www.braintreepayments.com/docs/node/subscriptions/overview

			console.log('saleRequest');
			console.log(saleRequest);
			gateway.transaction.sale(saleRequest, function (err, result) {
				console.log('err:')
				console.log(err)
				console.log('transaction result:');
				console.log(result);
				if (result.success) {

					// reset error property
					req.session.declined = false;

					// TODO: Here is probably where we should save the customerId on a new user account
					// We should also record on the user model what the user purchased this session 
					// 		Or have a new model just for Purchases keyed on user id?
					// - Product SKU's are defined in bitponics/utils/db_init/seed_data/bitponicsProducts.js
					// - Can get result.transaction.customer.id here
					// We'll want to be able to search on the customerId later
					// https://www.braintreepayments.com/docs/node/customers/search

					console.log('result.transaction.customer.id:');
					console.log(result.transaction.customer.id);

					// TODO: decrement the Base Station inventory by baseStationQuantity

					// TODO: send confimation email now as well

					res.redirect('/buy/confirmation');
				} else {
					req.session.declined = true;
					res.redirect('/buy/checkout');
				}
			});
		}
	);
*/

	/**
	 * Order Confirmation Page
	 * 
	 */
	app.get('/buy/confirmation',
		routeUtils.middleware.ensureSecure, 
		function (req, res, next) {
			
			// Only grabbing the Base Station data since thats the only one that can sell out
			ProductModel.findById(baseStationProductId)
				.exec(function(err, bitponicsBaseStation){
					if (err) { return next(err); }
					console.log(req.session.tempUserInfo);
					var locals = {
							title: 'Order Complete - Bitponics',
							className: "landing-page single-page getstarted register buy",
							pageType: "landing-page",
							braintreeClientSideKey: braintreeConfig.braintreeClientSideKey,
							bitponicsProducts: {},
              order : (req.session.order || null),
							tempUserInfo: req.session.tempUserInfo ? req.session.tempUserInfo : null
						};

					locals.bitponicsProducts[bitponicsBaseStation._id] = bitponicsBaseStation;

					res.render('./buy/confirmation', locals);
				});
		}
	);

};