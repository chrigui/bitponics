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
          controller: [
            '$scope', '$element', '$attrs', '$transclude', '$http', 'sharedDataService',
            function ($scope, $element, $attrs, $transclude, $http, sharedDataService){
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

            }
          ],
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


    /** 
     * This overrides the default contenteditable to be one that can be bound to ng-model
     * 
     * taken from http://docs.angularjs.org/api/ng.directive:ngModel.NgModelController
     * with the following changes:
     * - prevent assigning of <br> by default
     * - prevent automatic read() on creation
     */
    bpnDirectives.directive('contenteditable', function() {
      return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function(scope, element, attrs, ngModel) {
  
          if(!ngModel) return; // do nothing if no ng-model
  
          // Specify how UI should be updated
          ngModel.$render = function() {
            element.html(ngModel.$viewValue || '');
          };
   
          // Listen for change events to enable binding
          element.on('blur keyup', function() {
            scope.$apply(read);
          });
          
          // Write data to the model
          function read() {
            var html = element.html();
            // When we clear the content editable the browser leaves a <br> behind
            if( html == '<br>' ) {
              html = '';
            }
            ngModel.$setViewValue(html);
          }
        }
      };
    });

    return bpnDirectives;
	}
);
