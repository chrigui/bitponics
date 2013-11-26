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
						{ id: '@_id'},
						{
							updateSettings: { method:'POST', isArray: false, transformRequest: function (data, headersGetter) {
	                var result = data.settings,
	                	json = JSON.stringify({ settings: result });
	                return json;
        	    }},

        	    complete: { method:'POST', isArray: false, transformRequest: function(data, headersGetter){
                return JSON.stringify({active : false });
              }},

        	    delete: { method:'DELETE', isArray: false }
			        	    
						}
					);
				}
			]
		);
	}
);
