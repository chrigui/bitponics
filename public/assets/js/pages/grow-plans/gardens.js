/**
 * Main file for /grow-plans/:id/gardens
 *
 * Depends on following globals:
 * - bpn
 * - bpn.user
 * - bpn.plants
 * - bpn.pageData.growPlan
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
  'bpn.services.growPlan',
  'bpn.services.garden'
],
function (angular, domReady, viewModels, moment, feBeUtils) {
  'use strict';

  var app = angular.module('bpn.apps.growPlan.gardens', ['bpn', 'ui', 'ui.bootstrap']);


  app.controller('bpn.controllers.growPlan.gardens.Main', [
    '$scope',
    'GardenModel',
    function($scope, GardenModel){
      $scope.growPlan = bpn.pageData.growPlan;
      $scope.plants = bpn.plants;
      $scope.plantsById = {};
      $scope.plants.forEach(function(plant){
        $scope.plantsById[plant._id] = plant;
      });

      $scope.init = function(){
        $scope.gardenResults = GardenModel.query(
          { 
            where : JSON.stringify({ 'growPlan' : $scope.growPlan._id}),
            select : 'name,startDate,owner.name,growPlan.name,growPlan.plants'
          },
          function success(data){
            console.log(data);
          }
        );
      };

      $scope.init();
    }
  ]);


  domReady(function () {
    angular.bootstrap(document, ['bpn.apps.growPlan.gardens']);
  });

  return app;
});