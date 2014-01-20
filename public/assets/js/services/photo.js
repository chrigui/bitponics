define([
	'bpn.services'
	], 
	function (bpnServices) {
		'use strict';

		return bpnServices.factory('PhotosModel', 
			[
				'$resource', 
				function ($resource) {
					return $resource('/api/gardens/:id/photos',
						{ id: '@_id' },
						{
			              query: {
			                method: 'GET',
			                isArray: false
			              }
			            }
					);
				}
			]
		);
	}
);
