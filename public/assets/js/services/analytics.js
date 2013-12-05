/**
 * Central analytics service
 * Controls google analytics and mixpanel
 *
 * Depends on the following globals:
 * - _gaq
 * - mixpanel
 */
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
	      var trackPageView = function() {
	        console.log("TRACKING PAGEVIEW: " + $window.location.pathname);
          
          $window._gaq.push(['_trackPageview', $window.location.pathname]);

          $window.mixpanel.track("page viewed", {'page name': $window.document.title, 'url' : $window.location.pathname });
	      };
	      $rootScope.$on('$viewContentLoaded', trackPageView);

        
        var track = function(eventName, props){
          console.log("TRACKING EVENT: " + eventName, props);
          $window.mixpanel.track(eventName, props);
        };

        var increment = function(numericProperty){
          console.log("TRACKING INCREMENT: " + numericProperty);
          $window.mixpanel.people.increment(numericProperty);
        };

        return {
          track : track,
          increment : increment
        }
	    }
	  ]);
	}
);
