/**
 * Depends on the following globals:
 * - bpn.user
 */

define([
	'bpn.services',
  'fe-be-utils',
  'bpn.services.user',
  'bpn.services.notification'
	], 
	function (bpnServices, feBeUtils) {
		'use strict';

		return bpnServices.factory('NavService', 
			[
        'UserModel',
        'NotificationModel',
				function (UserModel, NotificationModel) {
          console.log('called"')
          var navService = {
            openGardenSettingsOverlay : false, //closed by default
            recentNotifications : []
          };
            
          
          navService.clearAllNotifications = function(){
            navService.recentNotifications.data.forEach(function(notification){
              NotificationModel.markAsChecked(notification);
            });
          };

          navService.clearInfoNotifications = function(){
            navService.recentNotifications.data.forEach(function(notification){
              if(notification.type === feBeUtils.NOTIFICATION_TYPES.INFO){
                NotificationModel.markAsChecked(notification);
              }
            });
          };

          navService.getRecentNotifications = function(){
            if (!navService.user){ return; }

            navService.user.$getRecentNotifications({},
              function success(data){
                
                navService.recentNotifications = data;
                
                navService.hasUncheckedNotifications = navService.recentNotifications.data.some(function(notification){
                  if (!notification.checked){
                    return true;
                  }
                });

                navService.hasUncheckedActionNeededNotifications = navService.recentNotifications.data.some(function(notification){
                  if (!notification.checked &&
                        (notification.type === feBeUtils.NOTIFICATION_TYPES.ACTION_NEEDED || notification.type === feBeUtils.NOTIFICATION_TYPES.ERROR)
                      ){
                    return true;
                  }
                });
              }
            );
          };

          if (bpn.user){
            navService.user = new UserModel(bpn.user);
            navService.getRecentNotifications();
            // socket.connect('/new-notifications');
            // socket.emit('ready');
            // socket.on('new-notifications', function(data){
            //   console.log('new-notifications socket update received', data);
            // });
          } // /bpn.user

					return navService;
				}
			]
		);
	}
);