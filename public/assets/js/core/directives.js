define(['angular'], 
	function(angular) { 
		'use strict'; 
		var bpnDirectives = angular.module('bpn.directives', []);

    // http://stackoverflow.com/a/15253892/117331
    bpnDirectives.directive('bpnDirectivesUppercase', function() {
      return {
        priority: 200, // give it higher priority than the input mask
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
          var uppercase = function(inputValue) {
            var upperCased = inputValue.toUpperCase();
            if(upperCased !== inputValue) {
              modelCtrl.$setViewValue(upperCased);
              modelCtrl.$render();
            }         
            return upperCased;
          };
          modelCtrl.$parsers.push(uppercase);
          uppercase(scope[attrs.ngModel]); 
        }
      };
    });

    return bpnDirectives;
	}
);
