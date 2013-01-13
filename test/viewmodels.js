var should = require('should'),
requirejs = require('requirejs'),
sampleGrowPlans = require('../utils/db_init/seed_data/growPlans');

requirejs.config({
	nodeRequire: require,
	baseUrl : 'public/assets/js/shared'
});
var viewModels = requirejs('viewmodels');

describe('ViewModels', function(){

});