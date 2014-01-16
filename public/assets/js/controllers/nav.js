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
    'fe-be-utils',
    'bpn.services.nav',
    'bpn.services.user',
    'angularDialog'
	],
  function (bpnControllers, feBeUtils) {
    'use strict';

    var notificationsController = bpnControllers.controller('bpn.controllers.nav.Notifications',
      [
        '$scope',
        '$filter',
        '$compile',
        'UserModel',
        function ($scope, $filter, $compile, UserModel) {
          $scope.recentNotifications = $scope.$parent.ngDialogData;
          $scope.element = $scope.$parent.ngDialogElement;
          console.log('gettin in here', $scope, $scope.element, $scope.recentNotifications)

          $scope.getNotificationClass = function(notification){
            var classNames = ['notification'];
            
            if (notification.checked){
              classNames.push('checked');
            } else {
              if (notification.type === feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED || notification.type === feBeUtils.NOTIFICATION_TYPES.ERROR){
                classNames.push('warning');  
              }
            }
            return classNames;
          };

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
            var classNames = ['icon-glyph notifications-icon'];
            if ($scope.hasUncheckedActionNeededNotifications){
              classNames.push('icon_notification_warning');
            } else if ($scope.hasUncheckedNotifications){
              classNames.push('icon_notification_info_textGray');
            } else {
              classNames.push('icon_notification_info_textGray');
            }
            return classNames;
          };

          if (bpn.user){
            $scope.user = new UserModel(bpn.user);
            $scope.user.$getRecentNotifications({},
              function success(data){
                
                $scope.recentNotifications = data;
                
                $scope.hasUncheckedNotifications = $scope.recentNotifications.data.some(function(notification){
                  if (!notification.checked){
                    return true;
                  }
                });

                $scope.hasUncheckedActionNeededNotifications = $scope.recentNotifications.data.some(function(notification){
                  if (!notification.checked &&
                        (notification.type === feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED || notification.type === feBeUtils.NOTIFICATION_TYPES.ERROR)
                      ){
                    return true;
                  }
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