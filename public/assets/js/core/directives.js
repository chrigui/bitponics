/**
 * Create top-level directives module
 * 
 * Include common shared directives
 */
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


     bpnDirectives.directive('bpnDirectivesSelectOnClick', function () {
      return function (scope, element, attrs) {
          element.click(function () {
              element.select();
          });
      };
    });


    bpnDirectives.directive('bpnDirectivesIfThumbnail404', function() {
      return {
        link: function(scope, element, attrs) {
          element.bind('error', function() {
            element.attr('src', attrs.ifThumbnail404);
          });
        }
      }
    });


    bpnDirectives.directive('bpnDirectivesSmartOverlay', [
      '$window',
      '$timeout',
      function($window, $timeout) {
        return {
          controller: function ($scope, $element, $attrs, $transclude, $http, sharedDataService){
            $scope.$watch('sharedDataService.activeOverlay', function (newVal, oldVal) {
              $scope.sharedDataService.activeOverlayPositionTop = angular.element($window)[0].scrollY;
              $scope.setOverlayPosition();
            });

            $scope.setOverlayPosition = function() {
              $.throttle(1000, $timeout(function() {
                var overlay = $element.parents('.page:first').siblings('.overlay:first'),
                    overlayHeight = overlay.height(),
                    topValue = $scope.sharedDataService.activeOverlayPositionTop,
                    windowHeight = angular.element($window).height(),
                    padding = 144;
                if (overlay.length > 0) {
                  if ((windowHeight > overlayHeight + padding)) {
                    overlay.css({ top: topValue + padding });
                    $scope.$apply(); 
                  }
                }
              }, 500));
            };

          },
          link: function(scope, element, attrs, controller) {
            angular.element($window).bind("scroll", function() {
              scope.sharedDataService.activeOverlayPositionTop = this.scrollY;
              scope.setOverlayPosition();
            });
          }
        };
      }
    ]);

    
    bpnDirectives.directive('bpnDirectivesIntercomTrigger', [
      '$timeout',
      function($timeout) {
        return {
          link: function(scope, element, attrs) {
            // TODO: this isn't working. investigate
            $timeout(function(){
              element.addClass('.intercom-trigger');
              window.Intercom('reattach_activator');
            }, 10);
          }
        }
      }
    ]);


    return bpnDirectives;
	}
);
