define([
	'bpn.services'
	], 
	function (bpnServices) {
		'use strict';

		return bpnServices.factory('GrowSystemModel', 
			[
				'$resource', 
				function ($resource) {
					return $resource('/api/grow-systems/:id', 
						{ id: '@_id'}
					);
				}
			]
		);
	}
);
