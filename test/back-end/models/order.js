var mongooseConnection = require('../../../config/mongoose-connection').open('test'),
	mongoose = require('mongoose'),
	braintreeConfig = require('../../../config/braintree-config').setEnvironment('ci'),
  Order = require('../../../models/order'),
  should = require('should'),
  moment = require('moment'),
  i18nKeys = require('../../../i18n/keys');

