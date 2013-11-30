define(['angular'], 
	function(angular) { 
		'use strict';
		
		var bpnFilters = angular.module('bpn.filters', []); 

		
		bpnFilters.filter('controlValueToWord', function() {
      return function(input, lowercase) {
        var out = "";
        if(parseInt(input, 10) === 0){
          out += "Off";
        } else {
          out += "On"
        }
        // conditional based on optional argument
        if (lowercase) {
          out = out.toLowerCase();
        }
        return out;
      }
    });

    
    bpnFilters.filter('friendlyDate', function() {
      return function(input, format) {
        var val = moment(input).calendar();

        if (format === 'lowercase'){
          return val.charAt(0).toLowerCase() + val.slice(1);  
        } else {
          return val.charAt(0).toUpperCase() + val.slice(1);  
        }
        
      }
    });


    bpnFilters.filter('sensorValueDisplay', function() {
      return function(input) {
        if (typeof input === 'undefined' || input === null) {
          return "----"
        } else {
          return input;
        }
      }
    });

    
    bpnFilters.filter('photoDate', function() {
      return function(input) {
        var val = moment(input).format("MMMM Do YYYY, h:mm a");
        return val;
      }
    });

    
    bpnFilters.filter('timeOfDayFromMilliseconds', function() {
      return function(input) {
        return feBeUtils.getTimeOfDayFromMilliseconds(input);
      };
    });


		return bpnFilters;
	}
);
