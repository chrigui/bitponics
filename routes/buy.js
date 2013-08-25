var async = require('async'),
	winston = require('winston'),
	routeUtils = require('./route-utils'),
	braintree = require('braintree');
	

module.exports = function(app){

	/*
	 * Order/Preorder Landing Page
	 * 
	 */
	app.get('/buy',
		routeUtils.middleware.ensureSecure, 
		function (req, res, next) {
			var locals = {
					title: 'Purchase a Bitponics Device!',
					className: "landing-page single-page getstarted register buy",
					pageType: "landing-page"
				},
				gateway = braintree.connect({
				  environment: braintree.Environment.Sandbox,
				  merchantId: "4dybwt8nvnv6t5vd",
				  publicKey: "m8tmzkhb7p3kcsfs",
				  privateKey: "a661ec0371505cff4cc4b4c43caa8f43"
				});

			res.render('buy', locals);
		}
	);

	app.post("/create_transaction", function (req, res) {
		var saleRequest = {
				amount: "1000.00",
				creditCard: {
					number: req.body.number,
					cvv: req.body.cvv,
					expirationMonth: req.body.month,
					expirationYear: req.body.year
				},
				options: {
					submitForSettlement: true
				}
			},
			gateway = braintree.connect({
			  environment: braintree.Environment.Sandbox,
			  merchantId: "4dybwt8nvnv6t5vd",
			  publicKey: "m8tmzkhb7p3kcsfs",
			  privateKey: "a661ec0371505cff4cc4b4c43caa8f43"
			});

		gateway.transaction.sale(saleRequest, function (err, result) {
			if (result.success) {
				res.send("<h1>Success! Transaction ID: " + result.transaction.id + "</h1>");
			} else {
				res.send("<h1>Error:  " + result.message + "</h1>");
			}
		});
	});

};