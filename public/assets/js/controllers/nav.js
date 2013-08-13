define(
	[
  	'controllers'
	],
  function (bpnControllers) {
    'use strict';

    return bpnControllers.controller('bpn.controllers.Nav',
      [
        '$scope',
        '$filter',
        '$compile',
        function ($scope, $filter, $compile) {
          // init
          $scope.settingsDisplayVisible = false;

          $scope.toggleSettings = function(){
            $scope.settingsDisplayVisible = !$scope.settingsDisplayVisible;
          }
        }
      ]
    )
  }
);