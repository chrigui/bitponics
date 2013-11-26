define([
	'bpn.services'
	], 
	function (bpnServices) {
		'use strict';

		return bpnServices.factory('NavService', 
			[
				'$resource', 
				function ($resource) {
					return {
						openGardenSettingsOverlay: false //closed by default
					}
				}
			]
		);
	}
);