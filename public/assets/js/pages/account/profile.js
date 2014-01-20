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

  var app = angular.module('bpn.apps.account.profile', ['bpn', 'ngResource', 'ui', 'ui.bootstrap']);
 
  
  app.controller('bpn.controllers.account.profile.Main',
    [
      '$scope',
      '$filter',
      function ($scope, $filter) {
        // console.log('yay');
      }
    ]
  );

  domReady(function () {
    angular.bootstrap(document, ['bpn.apps.account.profile']);
  });

});