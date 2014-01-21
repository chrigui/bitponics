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
							update: { method:'PUT', isArray: false},
              save: { 
                method:'POST', 
                isArray: false,
                url: '/api/devices/'
              },
              saveSensors : {
                method:'PUT', 
                transformRequest: function (data, headersGetter) {
                  var json = JSON.stringify({ sensors: data.sensors });
                  return json;
                }
              }
						}
					);
				}
			]
		);
	}
);
