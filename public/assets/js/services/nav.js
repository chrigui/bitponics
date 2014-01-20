define([
	'bpn.services'
	], 
	function (bpnServices) {
		'use strict';

		return bpnServices.factory('NavService', 
			[
				function () {
					return {
						openGardenSettingsOverlay: false //closed by default
					}
				}
			]
		);
	}
);