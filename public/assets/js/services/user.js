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
						{ id: '@_id'}
					);
				}
			]
		);
	}
);
