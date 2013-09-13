var async = require('async'),
	winston = require('winston'),
	routeUtils = require('./route-utils'),
	braintree = require('braintree'),
	ProductModel = require('../models/product').model,
	baseStationProductSKU = 'HBIT0000001';
	

module.exports = function(app){
	var braintreeConfig = require('../config/braintree-config')(app.settings.env),
		gateway = braintree.connect(braintreeConfig.braintreeGatewayConfig);

	/*
	 * Order/Preorder Landing Page
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

	/*
	 * Order Checkout Page
	 * 
	 */
	app.get('/buy/checkout',
		routeUtils.middleware.ensureSecure, 
		function (req, res, next) {

			// Only grabbing the Base Station data since thats the only one that can sell out
			ProductModel.findOne({ 'SKU': baseStationProductSKU })
				.exec(function(err, bitponicsBaseStation){
					if (err) { return next(err); }
					var locals = {
						title: 'Checkout - Bitponics',
						className: "landing-page single-page getstarted register buy",
						pageType: "landing-page",
						braintreeClientSideKey: braintreeConfig.braintreeClientSideKey,
						bitponicsProducts: {},
						transactionError: req.session.declined ? req.session.declined : null,
						tempUserInfo: req.session.tempUserInfo ? req.session.tempUserInfo : null
					};

					locals.bitponicsProducts[bitponicsBaseStation.SKU] = bitponicsBaseStation;

					res.render('./buy/checkout', locals);
				});

			
		}
	);

	/*
	 * CC info form POST
	 * Connects to Braintree to verify CC info
	 * Creates customer in Braintree Vault, then does pre-auth since we're only taking pre-orders now
	 */
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

	/*
	 * Order Confirmation Page
	 * 
	 */
	app.get('/buy/confirmation',
		routeUtils.middleware.ensureSecure, 
		function (req, res, next) {
			
			// Only grabbing the Base Station data since thats the only one that can sell out
			ProductModel.findOne({ 'SKU': baseStationProductSKU })
				.exec(function(err, bitponicsBaseStation){
					if (err) { return next(err); }
					console.log(req.session.tempUserInfo);
					var locals = {
							title: 'Order Complete - Bitponics',
							className: "landing-page single-page getstarted register buy",
							pageType: "landing-page",
							braintreeClientSideKey: braintreeConfig.braintreeClientSideKey,
							bitponicsProducts: {},
							tempUserInfo: req.session.tempUserInfo ? req.session.tempUserInfo : null
						};

					locals.bitponicsProducts[bitponicsBaseStation.SKU] = bitponicsBaseStation;

					res.render('./buy/confirmation', locals);
				});
		}
	);

};