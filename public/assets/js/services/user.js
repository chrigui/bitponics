define([
	'bpn.services',
  'view-models',
  'bpn.services.notification'
	], 
	function (bpnServices, viewModels) {
		'use strict';

		return bpnServices.factory('UserModel', 
			[
				'$resource', 
        'NotificationModel',
				function ($resource, NotificationModel) {
					return $resource('/api/users/:id', 
						{ id: '@_id'},
            {
              getRecentNotifications : {
                method: 'GET',
                isArray : false,
                url : '/api/users/:id/recent-notifications',
                transformResponse : function(data, headersGetter){
                  var json = JSON.parse(data);
                  json.data = viewModels.initNotificationsViewModel(json.data);
                  json.data = json.data.map(function(notification){
                    return new NotificationModel(notification);
                  });
                  console.log('getRecentNotifications', json);
                  return json;
                }
              },
            }
					);
				}
			]
		);
	}
);
