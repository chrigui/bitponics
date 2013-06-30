require([
  'angular',
  'domReady',
  'fe-be-utils',
  'angularResource',
  'es5shim',
  'angularUI',
  'angularUIBootstrap',
  'overlay'
],
function (angular, domReady, feBeUtils) {
  'use strict';

  var outletApp = angular.module('bpn.apps.account.outletMap', ['ngResource', 'ui', 'ui.bootstrap']).run(

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
  );

  // outletApp.config(
  //   [
  //     '$locationProvider',
  //     '$routeProvider',
  //     function($locationProvider, $routeProvider) {
  //       $locationProvider.html5Mode(true);
  //       $locationProvider.hashPrefix = '!';

  //       $routeProvider
  //         .when('/', {
  //           controller: 'bpn.controllers.setup.device.Connect',
  //           templateUrl: 'connect.html'
  //         })
  //         .when('/wifi', {
  //           controller: 'bpn.controllers.setup.device.Wifi',
  //           templateUrl: 'wifi.html'
  //         })
  //         .when('/pair', {
  //           controller: 'bpn.controllers.setup.device.Pair',
  //           templateUrl:'pair.html'
  //         })
  //         .otherwise({redirectTo:'/'});
  //     }
  //   ]
  // );

  outletApp.factory('sharedDataService', function(){
      return {
        controls : bpn.controls,
        activeOverlay : { is: undefined },
        modalOptions : {
          backdropFade: true,
          dialogFade: true,
          dialogClass : 'overlay auto-size'
        }
      };
  });

  outletApp.controller('bpn.controllers.account.outletMap.Main',
    [
      '$scope',
      '$filter',
      'sharedDataService',
      function ($scope, $filter, sharedDataService) {
      	$scope.sharedDataService = sharedDataService;
        console.log('yay:');
        console.log(sharedDataService.controls);
      }
    ]
  );

  domReady(function () {
    angular.bootstrap(document, ['bpn.apps.account.outletMap']);
  });

  

});
