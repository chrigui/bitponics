define([
	'bpn.services'
	], 
	function (bpnServices) {
		'use strict';

		return bpnServices.factory('PlantModel', 
			[
				'$resource', 
				function ($resource) {
					return $resource('/api/plants/:id', 
						{ id: '@_id'}
					);
				}
			]
		);
	}
);
