require([
  'angular',
  'domReady',
  'fe-be-utils',
  'angularResource',
  'es5shim',
  'angularUI',
  'angularUIBootstrap',
  'overlay',
  'controller-nav'
],
function (angular, domReady, feBeUtils) {
  'use strict';

  var devicesApp = angular.module('bpn.apps.account.devices', ['ngResource', 'ui', 'ui.bootstrap', 'bpn.controllers']).run(

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

  devicesApp.factory('sharedDataService', function(){
      return {
        activeOverlay : { is: undefined },
        modalOptions : {
          backdropFade: true,
          dialogFade: true,
          dialogClass : 'overlay auto-size'
        }
      };
  });
  
  devicesApp.controller('bpn.controllers.account.devices.Main',
    [
      '$scope',
      '$filter',
      'sharedDataService',
      function ($scope, $filter, sharedDataService) {
        // console.log('yay');
      }
    ]
  );

  domReady(function () {
    angular.bootstrap(document, ['bpn.apps.account.devices']);
  });

});