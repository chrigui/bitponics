var mongooseConnection = require('../config/mongoose-connection').open('test'),
	should = require('should'),
  requirejs = require('../lib/requirejs-wrapper'),
  Models = require('../models'),
  Action = Models.action,
  ModelUtils = Models.utils,
  viewModels = requirejs('view-models');

describe('ViewModels', function(){
  it('converts a single-state Action server model to a viewmodel and back to an equivalent Action server model', function(done){
    Action.findById('506de2fb8eebf7524342cb28', function(err, actionResult){
      should.exist(actionResult);
      var originalActionResult = JSON.parse(JSON.stringify(actionResult)),
        actionViewModel = viewModels.initActionViewModel(actionResult),
        viewModelConvertedToServerModel = viewModels.compileActionViewModelToServerModel(actionViewModel);
      Action.isEquivalentTo(originalActionResult, viewModelConvertedToServerModel).should.be.true;
      done();
    });
  });

  it('converts a dual-state Action server model to a viewmodel and back to an equivalent Action server model', function(done){
    Action.findById('506de2f08eebf7524342cb26', function(err, actionResult){
      should.exist(actionResult);
      var originalActionResult = JSON.parse(JSON.stringify(actionResult)),
        actionViewModel = viewModels.initActionViewModel(actionResult),
        viewModelConvertedToServerModel = viewModels.compileActionViewModelToServerModel(actionViewModel);
      Action.isEquivalentTo(originalActionResult, viewModelConvertedToServerModel).should.be.true;
      done();
    });
  });

  it('converts an offset dual-state Action server model to a viewmodel and back to an equivalent Action server model', function(done){
    Action.findById('506de2f18eebf7524342cb27', function(err, actionResult){
      should.exist(actionResult);
      var originalActionResult = JSON.parse(JSON.stringify(actionResult)),
          actionViewModel = viewModels.initActionViewModel(actionResult),
        viewModelConvertedToServerModel = viewModels.compileActionViewModelToServerModel(actionViewModel);
      Action.isEquivalentTo(originalActionResult, viewModelConvertedToServerModel).should.be.true;
      done();
    });
  });

  it('converts an offset "reminder" Action server model to a viewmodel and back to an equivalent Action server model', function(done){
    Action.findById('506de3128eebf7524342cb87', function(err, actionResult){
      should.exist(actionResult);
      var originalActionResult = JSON.parse(JSON.stringify(actionResult)),
          actionViewModel = viewModels.initActionViewModel(actionResult),
        viewModelConvertedToServerModel = viewModels.compileActionViewModelToServerModel(actionViewModel);
      
      console.log(JSON.stringify(originalActionResult));
      console.log(JSON.stringify(viewModelConvertedToServerModel));

      Action.isEquivalentTo(originalActionResult, viewModelConvertedToServerModel).should.be.true;
      done();
    });
  });

  /*
  it('converts a Grow Plan server model to a viewmodel and back to an equivalent Grow Plan server model', function(done){
    ModelUtils.getFullyPopulatedGrowPlan({_id: '506de30c8eebf7524342cb70'}, function(err, growPlans){
      should.exist(growPlans[0]);
      var growPlan = growPlans[0],
          originalGrowPlan = JSON.parse(JSON.stringify(growPlan)),
        viewModel = viewModels.initGrowPlanViewModel(growPlan),
        viewModelConvertedToServerModel = viewModels.compileGrowPlanViewModelToServerModel(viewModel);

        console.log(JSON.stringify(originalGrowPlan));
        console.log(JSON.stringify(viewModelConvertedToServerModel));


      Models.growPlan.isEquivalentTo(originalGrowPlan, viewModelConvertedToServerModel, function(err, isEquivalent){
        isEquivalent.should.be.true;
        done();
      });
    });
  });
*/
});