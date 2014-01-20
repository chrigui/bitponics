/**
 * Resource wrapper for GrowPlan model
 * 
 * Transforms between viewModel/serverModel automatically
 * 
 * Dependent on global bpn.pageData.controlsById
 */
 define([
	'bpn.services',
  'view-models'
	], 
	function (bpnServices, viewModels) {
		'use strict';

		return bpnServices.factory('NotificationModel', 
			[
				'$resource', 
				function ($resource) {
					return $resource('/api/notifications/:id', 
						{ id: '@_id'},
						{
        	    get : {
                method: 'GET',
                isArray : false,
                transformResponse : function(data, headersGetter){
                  return viewModels.initNotificationViewModel(JSON.parse(data));
                }
              },
              markAsChecked : { 
                method:'POST',
                url : '/api/notifications/:id/mark-as-checked',
                transformRequest: function(data, headersGetter){
                  return '{}';
                }
              }
            }
					);
				}
			]
		);
	}
);
