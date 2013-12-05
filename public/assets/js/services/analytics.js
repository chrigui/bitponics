
define([
	'bpn.services'
	], 
	function (bpnServices, mixpanel) {
		'use strict';

		// http://stackoverflow.com/questions/10713708/tracking-google-analytics-page-views-with-angular-js
		return bpnServices.service('bpn.services.analytics', [
	    '$rootScope', 
      '$window', 
      '$location',
      '$document',
      function($rootScope, $window, $location, $document) {
	      var track = function() {
	        console.log("LOGGING PAGEVIEW: " + $location.path());
          
          $window._gaq.push(['_trackPageview', $location.path()]);

          $window.mixpanel.track("page viewed", {'page name': $window.document.title, 'url' : $location.path() });
	      };
	      $rootScope.$on('$viewContentLoaded', track);

                
	    }
	  ]);
	}
);
