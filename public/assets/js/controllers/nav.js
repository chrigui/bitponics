/**
 * Depends on following globals:
 * - bpn.user
 *
 * @module controllers/nav
 * 
 */
define(
	[
  	'bpn.controllers',
    'bpn.services.nav',
    'bpn.services.user'
	],
  function (bpnControllers, NavService) {
    'use strict';

    return bpnControllers.controller('bpn.controllers.Nav',
      [
        '$scope',
        '$filter',
        '$compile',
        'NavService',
        'UserModel',
        function ($scope, $filter, $compile, NavService, UserModel) {
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

          if (bpn.user){
            $scope.user = new UserModel(bpn.user);
            $scope.recentNotifications = $scope.user.$getRecentNotifications();  
          }
          
        }
      ]
    )
  }
);