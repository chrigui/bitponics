define([
	'bpn.services'
	], 
	function (bpnServices) {
		'use strict';

		return bpnServices.factory('GrowPlanModel', 
			[
				'$resource', 
				function ($resource) {
					return $resource('/api/grow-plans/:id', 
						{ id: '@_id'},
            {
              refreshActiveGardenCount: { 
                method: 'GET',
                url: '/api/grow-plans/:id/active-garden-count'
              }
            }
					);
				}
			]
		);
	}
);
