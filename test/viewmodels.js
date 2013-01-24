var should = require('should'),
requirejs = require('requirejs'),
Models = require('../models'),
sampleGrowPlans = require('../utils/db_init/seed_data/growPlans'),
sampleActions = require('../utils/db_init/seed_data/actions'),
Action = Models.action,
ModelUtils = Models.utils;

requirejs.config({
	nodeRequire: require,
	baseUrl : 'public/assets/js/shared'
});
var viewModels = requirejs('viewmodels');

describe('ViewModels', function(){
	it('converts a single-state Action server model to a viewmodel and back to an equivalent Action server model', function(done){
		Action.findById('506de2fb8eebf7524342cb28', function(err, actionResult){
			should.exist(actionResult);
			var actionViewModel = viewModels.initActionViewModel(actionResult),
				viewModelConvertedToServerModel = viewModels.compileActionViewModelToServerModel(actionViewModel);
			Action.isEquivalentTo(actionResult, viewModelConvertedToServerModel).should.be.true;
			done();
		});
	});
});