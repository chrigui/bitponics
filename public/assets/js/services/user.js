define([
	'bpn.services'
	], 
	function (bpnServices) {
		'use strict';

		return bpnServices.factory('UserModel', 
			[
				'$resource', 
				function ($resource) {
					return $resource('/api/users/:id', 
						{ id: '@_id'},
            {
              getRecentNotifications : {
                method: 'GET',
                isArray : false,
                url : '/api/users/:id/recent-notifications'
              },
            }
					);
				}
			]
		);
	}
);
