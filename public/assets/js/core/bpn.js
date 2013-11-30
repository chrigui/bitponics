/**
 * Core bitponics module.
 * Initializes code all bitponics pages should share.
 * 
 * Pulls in top-level namespaces (bpn.directives, bpn.controllers, bpn.services, bpn.filters)
 * All bpn code should live under one of those modules.
 * 
 * Beyond simple namespace imports, initializes the following:
 * - analytics
 * - nav controller
 * - angular view debug tools
 */
define([
	'angular',
	'bpn.controllers',
  'bpn.controllers.nav',
	'bpn.directives',
  'bpn.filters',
  'bpn.services',
  'bpn.services.analytics'
	], 
	function (angular) {
		'use strict';

		return angular.module(
			'bpn', 
			['bpn.controllers', 'bpn.directives', 'bpn.filters', 'bpn.services']).run(
      [
        '$rootScope',
        'bpn.services.analytics',
        function($rootScope) {
          /**
           * Debugging Tools
           *
           * Allows you to execute debug functions from the view
           */
          $rootScope.log = function(variable) {
            console.log(variable);
          };
          $rootScope.alert = function(text) {
            alert(text);
          };
        }  
      ]
    );
	}
);
