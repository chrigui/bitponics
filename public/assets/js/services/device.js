define([
	'bpn.services'
	], 
	function (bpnServices) {
		'use strict';

		return bpnServices.factory('DeviceModel', 
			[
				'$resource', 
				function ($resource) {
					return $resource('/api/devices/:id', 
						{ id: '@_id'},
						{
							update: { method:'PUT', isArray: false}
						}
					);
				}
			]
		);
	}
);
