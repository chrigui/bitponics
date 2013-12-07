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

    var cache = {
      devices : {},
      growPlans : {}
    },
    setDeviceCache = function(garden){
      if (typeof garden.device === 'object'){
        cache.devices[garden.device._id] = garden.device;
      }
    },

    getDeviceCache = function(garden){
      if (typeof garden.device === 'string'){
        garden.device = cache.devices[garden.device] || garden.device;
      } 
    },

    growPlanCache = {},

    setGrowPlanCache = function(garden){
      if (typeof garden.growPlan === 'object'){
        cache.growPlans[garden.growPlan._id] = garden.growPlan;
      }
    },
    getGrowPlanCache = function(garden){
      if (typeof garden.growPlan === 'string'){
        garden.growPlan = cache.growPlans[garden.growPlan] || garden.growPlan;
      } 
    },

    setCaches = function(garden){
      setDeviceCache(garden);
      setGrowPlanCache(garden);
    },
    getCaches = function(garden){
      getDeviceCache(garden);
      getGrowPlanCache(garden);
    };

		return bpnServices.factory('GardenModel', 
			[
				'$resource', 
				function ($resource) {
					return $resource('/api/gardens/:id', 
						{ id: '@_id'},
						{
							
              query : {
                method:'GET',
                isArray:false
              },

              get : {
                method: 'GET',
                isArray : false,
                transformResponse : function(data, headersGetter){
                  return viewModels.initGrowPlanInstanceViewModel(JSON.parse(data), bpn.pageData.controlsById);
                }
              },

              save : {
                method: 'POST',
                transformRequest: function(data, headersGetter){
                  setCaches(data);
                  return JSON.stringify(viewModels.compileGrowPlanInstanceViewModelToServerModel(data));
                },
                transformResponse : function(data, headersGetter){
                  data = JSON.parse(data);
                  getCaches(data);
                  return viewModels.initGrowPlanInstanceViewModel(data, bpn.controlsById);
                }
              },

              updateSettings : { 
                method:'POST', 
                transformRequest: function (data, headersGetter) {
	                var result = data.settings,
	                	json = JSON.stringify({ settings: result });
	                return json;
        	     }
             },

        	    complete : { 
                method:'POST',
                transformRequest: function(data, headersGetter){
                  return JSON.stringify({active : false });
                }
              },

              updateName : { 
                method : 'POST', 
                transformRequest: function(data, headersGetter){
                  
                  setCaches(data);

                  return JSON.stringify({
                    name : data.name
                  });
                },
                transformResponse : function(data, headersGetter){
                  data = JSON.parse(data);
                  console.log('data.device', data.device);
                  console.log('data.growPlan', data.growPlan);
                  getCaches(data);
                  console.log('data.device', data.device);
                  console.log('data.growPlan', data.growPlan);
                  return viewModels.initGrowPlanInstanceViewModel(data, bpn.controlsById);
                }
              },

              advancePhase : { 
                url: '/api/gardens/:id/activate-phase',
                method : 'POST', 
                transformRequest: function(data, headersGetter){
                  return JSON.stringify({
                    growPlanPhaseId : data.nextGrowPlanPhase._id
                  });
                }
              }	    
						}
					);
				}
			]
		);
	}
);
