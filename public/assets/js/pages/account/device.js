require([
  'angular',
  'domReady',
  'fe-be-utils',
  'angularResource',
  'es5shim',
  'angularUI',
  'angularUIBootstrap',
  'bpn',
  'overlay'
],
function (angular, domReady, feBeUtils) {
  'use strict';

  var devicesApp = angular.module('bpn.apps.account.devices', ['bpn', 'ngResource', 'ui', 'ui.bootstrap']);
 
  devicesApp.factory('sharedDataService', function(){
      return {
        activeOverlay : { is: undefined },
        modalOptions : {
          backdrop: true,
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