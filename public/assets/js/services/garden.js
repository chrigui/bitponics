define([
	'bpn.services'
	], 
	function (bpnServices) {
		'use strict';

		return bpnServices.factory('GardenModel', 
			[
				'$resource', 
				function ($resource) {
					return $resource('/api/gardens/:id', 
						{ id: '@_id'}
					);
				}
			]
		);
	}
);
