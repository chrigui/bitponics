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
			if (!req.session.tempUserInformation) {
				req.session.tempUserInformation = {
					email: '',
					password: '',
					number: '',
					cvv: '',
					month: '',
					year: ''
				};
			}

			ProductModel.findOne({ 'SKU': baseStationProductSKU })
				.exec(function(err, bitponicsBaseStation){
					if (err) { return next(err); }
					var locals = {
						title: 'Checkout - Bitponics',
						className: "landing-page single-page getstarted register buy",
						pageType: "landing-page",
						braintreeClientSideKey: braintreeConfig.braintreeClientSideKey,
						signupError: null,
						transactionError: req.session.declined ? req.session.declined : null,
						tempUserInformation: req.session.tempUserInformation,
						bitponicsProducts: {}
					};

					locals.bitponicsProducts[bitponicsBaseStation.SKU] = bitponicsBaseStation;

					console.log('req.session:');
					console.log(req.session);

					console.log('bitponicsBaseStation:');
					console.log(bitponicsBaseStation);

					res.render('./buy/checkout', locals);
				});

			
		}
	);

	/*
	 * CC info form POST
	 * Connects to Braintree to verify CC info
	 * TODO: client side form validation
	 */
	app.post("/buy/verify_transaction",
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
			};

			gateway.customer.create(customerRequest, function (err, result) {
				if (result.success) {
					var customerId = result.id;
					req.session.declined = false;
					res.redirect('/buy/confirm');
					
					console.log('customer created:'+ customerId);

					var saleRequest = {
						amount: '399.00',
						creditCard: {
							number: req.body.number,
							cvv: req.body.cvv,
							expirationMonth: req.body.month,
							expirationYear: req.body.year,
							billingAddress: {
								postalCode: req.body.postalCode
							}
						},
						customer: {
							id: customerId
						},
						// billing: {
						// 	firstName: 'Paul',
						// 	lastName: 'Smith',
						// 	company: 'Braintree',
						// 	streetAddress: '1 E Main St',
						// 	extendedAddress: 'Suite 403',
						// 	locality: 'Chicago',
						// 	region: 'Illinois',
						// 	postalCode: '60622',
						// 	countryCodeAlpha2: 'US'
						// },
						shipping: {
							firstName: req.body.firstName,
							lastName: req.body.lastName,
							streetAddress: req.body.streetAddress,
							extendedAddress: req.body.extendedStreetAddress,
							locality: req.body.locality,
							region: req.body.region,
							postalCode: req.body.postalCode,
							countryCodeAlpha2: 'US'
						},
						options: {
							storeInVault: true,
							addBillingAddressToPaymentMethod: true,
							storeShippingAddressInVault: true
						}
					};

				//save user info in session
				req.session.tempUserInformation = {
					email: req.body.email,
					password: req.body.password,
					number: req.body.number,
					cvv: req.body.cvv,
					month: req.body.month,
					year: req.body.year
				};

				gateway.transaction.sale(saleRequest, function (err, result) {
					if (result.success) {
						req.session.declined = false;
						res.redirect('/buy/confirm');
						// res.send("<h1>Success! Transaction ID: " + result.transaction.id + "</h1>");
					} else {
						req.session.declined = true;
						res.redirect('/buy/checkout?declined=true')
						// res.send("<h1>Error:  " + result.message + "</h1>");
					}
				});

				} else {
					req.session.declined = true;
					req.session.declinedMessage = result.message;
					res.redirect('/buy/checkout');
					// res.send("<h1>Error:  " + result.message + "</h1>");
				}
			});
		}
	);

	/*
	 * Order Confirm Page
	 * 
	 */
	app.get('/buy/confirm',
		routeUtils.middleware.ensureSecure, 
		function (req, res, next) {
			var locals = {
					title: 'Confirm Order - Bitponics',
					className: "landing-page single-page getstarted register buy",
					pageType: "landing-page",
					braintreeClientSideKey: braintreeConfig.braintreeClientSideKey,
					tempUserInformation: req.session.tempUserInformation,
					completedTransaction: req.session.completedTransaction
				};

			console.log('req.session:');
			console.log(req.session);

			res.render('./buy/confirm', locals);
		}
	);

	/*
	 * Confirm Order POST to braintree
	 * Here we submit transaction for settlement as opposed to just verify
	 * TODO:
	 *	on success: 
	 *		- show confirmation success message
	 *		- remind them that their bitponics account activation email has been sent
	 * 		- save transaction ID
	 *		- save user info in braintree vault
	 * 		- how and when to clear session data?
	 *	on fail:
	 *		- redirect to checkout page to re-check submitted info
	 *
	 * 
	 */
	app.post("/buy/create_transaction",
		routeUtils.middleware.ensureSecure, 
		function (req, res) {
			var saleRequest = {
					amount: "399.00",
					creditCard: {
						number: req.tempUserInformation.session.number,
						cvv: req.tempUserInformation.session.cvv,
						expirationMonth: req.tempUserInformation.session.month,
						expirationYear: req.tempUserInformation.session.year
					},
					options: {
						submitForSettlement: true
					}
				};

			gateway.transaction.sale(saleRequest, function (err, result) {
				if (result.success) {
					req.session.completedTransaction = true;
					res.redirect('/buy/confirm');
				} else {
					req.session.completedTransaction = false;
					req.session.declined = true;
					res.redirect('/buy/checkout');
				}
			});
		}
	);

};