/**
 * Resource wrapper for GrowPlan model
 * 
 * Transforms between viewModel/serverModel automatically
 * 
 * Dependent on global bpn.sensors
 */
define([
	'bpn.services',
  'view-models'
	], 
	function (bpnServices, viewModels) {
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
              },

              get : {
                method: 'GET',
                isArray : false,
                transformResponse : function(data, headersGetter){
                  return viewModels.initGrowPlanViewModel(JSON.parse(data), bpn.sensors);
                }
              },
            
              save : {
                method: 'POST',
                transformRequest: function(data, headersGetter){
                  return JSON.stringify(viewModels.compileGrowPlanViewModelToServerModel(data));
                },
                transformResponse : function(data, headersGetter){
                  return viewModels.initGrowPlanViewModel(JSON.parse(data), bpn.sensors);
                }
              }
            }
					);
				}
			]
		);
	}
);
