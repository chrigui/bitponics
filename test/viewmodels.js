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

	it('converts a dual-state Action server model to a viewmodel and back to an equivalent Action server model', function(done){
		Action.findById('506de2f08eebf7524342cb26', function(err, actionResult){
			should.exist(actionResult);
			var actionViewModel = viewModels.initActionViewModel(actionResult),
				viewModelConvertedToServerModel = viewModels.compileActionViewModelToServerModel(actionViewModel);
			Action.isEquivalentTo(actionResult, viewModelConvertedToServerModel).should.be.true;
			done();
		});
	});

	it('converts a tri-state (offset dual-state) Action server model to a viewmodel and back to an equivalent Action server model', function(done){
		Action.findById('506de2f18eebf7524342cb27', function(err, actionResult){
			should.exist(actionResult);
			var actionViewModel = viewModels.initActionViewModel(actionResult),
				viewModelConvertedToServerModel = viewModels.compileActionViewModelToServerModel(actionViewModel);
			Action.isEquivalentTo(actionResult, viewModelConvertedToServerModel).should.be.true;
			done();
		});
	});

	it('converts a Grow Plan server model to a viewmodel and back to an equivalent Grow Plan server model', function(done){
		ModelUtils.getFullyPopulatedGrowPlan({_id: '506de30c8eebf7524342cb70'}, function(err, growPlans){
			should.exist(growPlans[0]);
			var growPlan = growPlans[0],
				viewModel = viewModels.initGrowPlanViewModel(growPlan),
				viewModelConvertedToServerModel = viewModels.compileGrowPlanViewModelToServerModel(viewModel);
			Models.growPlan.isEquivalentTo(growPlan, viewModelConvertedToServerModel, function(err, isEquivalent){
				isEquivalent.should.be.true;	
				done();
			});
		});
	});
});