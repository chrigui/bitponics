require([
  'angular',
  'domReady',
  'fe-be-utils',
  'angularResource',
  'es5shim',
  'angularUI',
  'angularUIBootstrap',
  'bpn',
  'bpn.services.device',
  'selection-overlay',
  'overlay'
],
function (angular, domReady, feBeUtils) {
  'use strict';

  var outletApp = angular.module('bpn.apps.account.outletMap', ['bpn', 'ngResource', 'ui', 'ui.bootstrap']);

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
	      	userOwnedDevice : new DeviceModel(bpn.userOwnedDevice),
	        controls : bpn.controls,
	        currentVisibleOutput : 0,
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
      $scope.outputMap = sharedDataService.userOwnedDevice.outputMap;
			$scope.overlayItems = $scope.sharedDataService.controls;
			$scope.itemsPerPage = 10;

			$scope.toggleItemSelection = function(control, input){
				$scope.outputMap[sharedDataService.currentVisibleOutput].control = control;
				sharedDataService.userOwnedDevice.$update();
				$scope.close();
			};

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
        $scope.outputMap = sharedDataService.userOwnedDevice.outputMap;

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