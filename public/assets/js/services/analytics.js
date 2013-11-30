define([
	'bpn.services',
	'mixpanel'
	], 
	function (bpnServices, mixpanel) {
		'use strict';

		// http://stackoverflow.com/questions/10713708/tracking-google-analytics-page-views-with-angular-js
		
		return bpnServices.service('bpn.services.analytics', [
	    '$rootScope', '$window', '$location', function($rootScope, $window, $location) {
	      var track = function() {
	        $window._gaq.push(['_trackPageview', $location.path()]);
	      };
	      $rootScope.$on('$viewContentLoaded', track);
	    }
	  ]);
	}
);
