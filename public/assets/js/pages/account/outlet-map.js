require([
  'angular',
  'domReady',
  'fe-be-utils',
  'angularResource',
  'es5shim',
  'angularUI',
  'angularUIBootstrap',
  '/assets/js/services/device.js',
  'selection-overlay',
  'overlay',
  'controller-nav'
],
function (angular, domReady, feBeUtils) {
  'use strict';

  var outletApp = angular.module('bpn.apps.account.outletMap', ['ngResource', 'ui', 'ui.bootstrap', 'bpn.services', 'bpn.controllers']).run(
    ['$rootScope',
      function($rootScope) {
        /**
         * Debugging Tools
         *
         * Allows you to execute debug functions from the view
         */
        $rootScope.log = function(variable) {
          console.log(variable);
        };
        $rootScope.alert = function(text) {
          alert(text);
        };
      
      }
    ]
  );

  // outletApp.factory('DeviceLoader', 
  //     [
  //       'DeviceModel', 
  //       'sharedDataService',
  //       '$route', 
  //       '$q',
  //       function(DeviceModel, sharedDataService, $route, $q) {
  //         return function() {
  //           DeviceModel.get( { id : bpn.userOwnedDevice._id }, 
  //               function (device) {
  //                 // viewModels.initGrowPlanViewModel(growPlan);
  //                 sharedDataService.userOwnedDevice = device;
  //                 delay.resolve(sharedDataService.userOwnedDevice);
  //               }, 
  //               function() {
  //                 delay.reject('Unable to fetch device '  + bpn.userOwnedDevice._id );
  //               }
  //             );
  //             return delay.promise; 
  //         };
  //       }
  //     ]
  //   );

  outletApp.factory('sharedDataService', 
  	[
	  	'DeviceModel',
      // 'DeviceLoader',
	  	function(DeviceModel){
	      return {
          // userOwnedDevice : DeviceLoader(),
	      	userOwnedDevice : new DeviceModel(bpn.userOwnedDevice),
	        controls : bpn.controls,
	        currentVisibleOutput : undefined,
	        activeOverlay : { is: undefined },
	        modalOptions : {
	          backdropFade : true,
	          dialogFade : true,
	          dialogClass : 'overlay'
	        }
	      };
	  	}
  	]
  );


  outletApp.controller('bpn.controllers.account.outputMapping.ControlOverlay',
	[
		'$scope',
		'sharedDataService',
		function($scope, sharedDataService){
			$scope.sharedDataService = sharedDataService;
			$scope.overlayItems = $scope.sharedDataService.controls;
			$scope.itemsPerPage = 10;

			$scope.toggleItemSelection = function(control, input){
				sharedDataService.userOwnedDevice.outputMap[sharedDataService.currentVisibleOutput].control = control;
				sharedDataService.userOwnedDevice.$update();
				$scope.close();
			};

  			// $scope.device = new DeviceModel($scope.sharedDataService.userOwnedDevice);

			//   	$scope.setControlMap = function(outputId, controlId){
			//   		$scope.device.outputMap.filter(function(output){
			//   			return output.outputId === outputId;
			//   		})[0].control = controlId;
			//   		$scope.device.$save;
			//   	};

			$scope.close = function(){
				$scope.sharedDataService.activeOverlay.is = undefined;
			};
		}
	]
  );


  outletApp.controller('bpn.controllers.account.outletMap.Main',
    [
      '$scope',
      '$filter',
      'sharedDataService',
      'DeviceModel',
      function ($scope, $filter, sharedDataService, DeviceModel) {
      	$scope.sharedDataService = sharedDataService;

    		$scope.setCurrentVisibleOutput = function (index) {
    			$scope.sharedDataService.currentVisibleOutput = index;
    			$scope.sharedDataService.activeOverlay.is = 'ControlOverlay';
    		};
      }
    ]
  );

  domReady(function () {
    angular.bootstrap(document, ['bpn.apps.account.outletMap']);
  });

});