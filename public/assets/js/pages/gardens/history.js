/**
 * Main file for /grow-plans/:id
 *
 * Depends on following globals:
 * - bpn
 * - bpn.user
 * - bpn.pageData.garden
 * - bpn.pageData.sensors
 * - bpn.pageData.controls
 */
require([
  'angular',
  'domReady',
  'view-models',
  'moment',
  'fe-be-utils',
  'es5shim',
  'angularUI',
  'angularUIBootstrap',
  'bpn',
  'bpn.directives.graphs',
  'bpn.services.garden'
],
function (angular, domReady, viewModels, moment, feBeUtils) {
  'use strict';

  var app = angular.module('bpn.apps.gardens.history', ['bpn', 'ui', 'ui.bootstrap']);


  app.controller('bpn.controllers.gardens.history.Main', [
    '$scope',
    'GardenModel',
    function($scope, GardenModel){
      

      $scope.init = function(){
        
      };


      $scope.init();
    }
  ]);


  domReady(function () {
    angular.bootstrap(document, ['bpn.apps.gardens.history']);
  });

  return app;
});