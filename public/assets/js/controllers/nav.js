define(
	[
  	'controllers',
    'bpn.services.nav'
	],
  function (bpnControllers, NavService) {
    'use strict';

    return bpnControllers.controller('bpn.controllers.Nav',
      [
        '$scope',
        '$filter',
        '$compile',
        'NavService',
        function ($scope, $filter, $compile, NavService) {
          // init
          $scope.settingsDisplayVisible = false;
          $scope.navMenuDisplayVisible = false;

          $scope.toggleSettings = function(){
            $scope.settingsDisplayVisible = !$scope.settingsDisplayVisible;
            NavService.openGardenSettingsOverlay = false;
          }

          $scope.toggleNavMenu = function(){
            $scope.navMenuDisplayVisible = !$scope.navMenuDisplayVisible;
          }

          $scope.openGardenSettingsOverlay = function() {
            NavService.openGardenSettingsOverlay = true;
          }
        }
      ]
    )
  }
);