/**
 * Main file for /grow-plans/:id
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
  'bpn.services.garden'
],
function (angular, domReady, viewModels, moment, feBeUtils) {
  'use strict';

  var app = angular.module('bpn.apps.gardens', ['bpn', 'ui', 'ui.bootstrap']);


  app.controller('bpn.controllers.gardens.Main', [
    '$scope',
    'GardenModel',
    function($scope, GardenModel){
      $scope.plants = bpn.plants;
      $scope.plantsById = {};
      $scope.plants.forEach(function(plant){
        $scope.plantsById[plant._id] = plant;
      });

      $scope.init = function(){
        $scope.communityGardenResults = GardenModel.query(
          { 
            where : JSON.stringify({ 'users' : { '$ne' : bpn.user._id }}),
            select : 'name,startDate,owner.name,growPlan.name,growPlan.plants'
          },
          function success(data){
            console.log(data);
          }
        );

        $scope.userGardenResults = GardenModel.query(
          { 
            where : JSON.stringify({ 'users' : bpn.user._id }),
            select : 'name,startDate,growPlan.name,growPlan.plants'
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
    angular.bootstrap(document, ['bpn.apps.gardens']);
  });

  return app;
});