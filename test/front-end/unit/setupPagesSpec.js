define([
  '/base/public/assets/js/pages/setup/grow-plan.js', 
  'jquery', 
  '../fixtures/bpn.js'
], function(app, $) {

  describe('Setup Pages', function() {

        var scope, bpn_controllers_setup_growPlan_Main;

        beforeEach(function(){
          var jasmineFixtures = jasmine.getFixtures();
          jasmineFixtures.fixturesPath = 'base/test/front-end/fixtures';
          
          var head = jasmineFixtures.load('setup/grow-plan-head.html'),
              body = jasmine.getFixtures('setup/grow-plan-body.html');
              
          // bpn = jasmine.getJSONFixtures('setup/bpn.json');

          // console.log('beforeEach bpn.userOwnedDevices', bpn.userOwnedDevices);
          // a module function, taking $provide as dependency
          // var apis = function($provide) {
          //     // override the factory with the mock/stub
          //     $provide.factory("userApi", function() {...});
          // };
          // runs(function () {
            // if (typeof bpn.apps === 'undefined') bpn.apps = {};
            // if (typeof bpn.apps.setup === 'undefined') bpn.apps.setup = {};
            // bpn.apps.setup.growPlan = {};
                // module('bpn.apps.setup.growPlan', []);
            // angular.bootstrap($('#jasmine-fixtures'), ['bpn.apps.setup.growPlan']);
            // setTimeout(done, 2000);
          // });
        });

        beforeEach(module('bpn.apps.setup.growPlan'));

        beforeEach(inject(function ($rootScope, $controller) {
          scope = $rootScope.$new();
          bpn_controllers_setup_growPlan_Main = $controller('bpn.controllers.setup.growPlan.Main', {$scope: scope});
        }));
        
        // afterEach(function(){
        //   var f = jasmine.getFixtures();
        //   f.cleanUp();
        //   f.clearCache();
        // });

        // it('should test the homePages controller', inject(function($controller, $rootScope) {
        //   var ctrl = $controller('HomeCtrl', {
        //     $scope : $rootScope
        //   });
        //   expect($rootScope.welcome_message.length).toBeGreaterThan(0);
        // }));
        
        it('should have sharedDataService with data', inject(function ($controller, $rootScope) {
          expect(typeof scope.sharedDataService).toBe('object');
          expect(scope.sharedDataService.plants.length > 0);
          expect(scope.sharedDataService.lightFixtures.length > 0);
          expect(scope.sharedDataService.lightBulbs.length > 0);
          expect(scope.sharedDataService.growSystems.length > 0);
          expect(scope.sharedDataService.nutrients.length > 0);
          expect(scope.sharedDataService.controls.length > 0);
          expect(scope.sharedDataService.sensors.length > 0);
        }));
  });

});