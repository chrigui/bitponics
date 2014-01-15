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
    'bpn.services.user',
    'angularDialog'
	],
  function (bpnControllers) {
    'use strict';

    var notificationsController = bpnControllers.controller('bpn.controllers.nav.Notifications',
      [
        '$scope',
        '$filter',
        '$compile',
        'UserModel',
        function ($scope, $filter, $compile, UserModel) {
          $scope.recentNotifications = $scope.$parent.ngDialogData;
          console.log('gettin in here', $scope, $scope.recentNotifications)
        }
      ]
    );

    var mainController = bpnControllers.controller('bpn.controllers.nav.Main',
      [
        '$scope',
        '$filter',
        '$compile',
        'NavService',
        'UserModel',
        'ngDialog',
        function ($scope, $filter, $compile, NavService, UserModel, ngDialog) {
          // init
          $scope.settingsDisplayVisible = false;
          $scope.navMenuDisplayVisible = false;

          $scope.toggleSettings = function(){
            $scope.settingsDisplayVisible = !$scope.settingsDisplayVisible;
            NavService.openGardenSettingsOverlay = false;
          };

          $scope.toggleNavMenu = function(){
            $scope.navMenuDisplayVisible = !$scope.navMenuDisplayVisible;
          };

          $scope.openGardenSettingsOverlay = function() {
            NavService.openGardenSettingsOverlay = true;
          };


          $scope.getNotificationsIconClass = function(){
            var classNames = ['notifications-icon'];
            if ($scope.hasUncheckedActionNeededNotifications){
              classNames.push('warning');
            };
            return classNames;
          };

          if (bpn.user){
            $scope.user = new UserModel(bpn.user);
            $scope.user.$getRecentNotifications({},
              function success(data){
                //console.log('$getRecentNotifications', data);
                $scope.recentNotifications = data;
                $scope.hasUncheckedActionNeededNotifications = $scope.recentNotifications.data.some(function(notification){

                });
              }
            );  
          }
          
        }
      ]
    );

    return mainController;
  }
);