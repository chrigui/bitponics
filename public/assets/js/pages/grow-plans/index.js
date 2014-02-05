/**
 * Main file for /grow-plans
 *
 * Depends on following globals:
 * - bpn
 * - bpn.user
 * - bpn.plants
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
  'bpn.services.growPlan'
],
function (angular, domReady, viewModels, moment, feBeUtils) {
  'use strict';

  var app = angular.module('bpn.apps.growPlans', ['bpn', 'ui', 'ui.bootstrap']);


  app.controller('bpn.controllers.growPlans.Main', [
    '$scope',
    'GrowPlanModel',
    function($scope, GrowPlanModel){
      $scope.plants = bpn.plants;
      $scope.plantsById = {};
      $scope.plants.forEach(function(plant){
        $scope.plantsById[plant._id] = plant;
      });

      $scope.init = function(){
        $scope.communityGrowPlans = GrowPlanModel.query(
          {
            where : JSON.stringify({ 'users' : { '$ne' : bpn.user._id }}),
            select : 'name,createdAt,createdBy.name,activeGardenCount,plants'
          },
          function success(data){
            console.log(data);
          }
        );

        $scope.userGrowPlans = GrowPlanModel.query(
          {
            where : JSON.stringify({ 'users' : bpn.user._id }),
            select : 'name,createdAt,createdBy.name,activeGardenCount,plants'
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
    angular.bootstrap(document, ['bpn.apps.growPlans']);
  });

  return app;
});
