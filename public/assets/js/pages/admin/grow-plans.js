require([
  'angular',
  'domReady',
  'moment',
  'fe-be-utils',
  'angularResource',
  'angularRoute',
  'es5shim',
  'angularUI',
  'angularUIBootstrap',
  'bpn',
  'bpn.services.socket',
  'bpn.services.growPlan'
],
  function (angular, domReady, moment, feBeUtils) {
    'use strict';

    var app = angular.module('bpn.apps.admin.growPlans', ['bpn', 'ui', 'ui.bootstrap', 'ngRoute']);

    app.controller('bpn.controllers.admin.growPlans.Main', 
      [
        '$scope',
        '$http',
        '$q',
        'GrowPlanModel',
        function ($scope, $http, $q, GrowPlanModel) {
          $scope.growPlans = bpn.pageData.growPlans;
          $scope.GrowPlanModel = GrowPlanModel;

          $scope.refreshActiveGardenCount = function(growPlan){
            console.log("refreshActiveGardenCount ", growPlan);

            var request = GrowPlanModel.refreshActiveGardenCount({ id: growPlan._id }, function(value){
              console.log('refreshActiveGardenCount callback', arguments);
              alert('done');
              growPlan.activeGardenCount = value.activeGardenCount;
            });
          };

          $scope.delete = function(growPlan){
            console.log("DELETING ", growPlan);

            var deleteRequest = GrowPlanModel.delete({ id: growPlan._id });
            deleteRequest.$promise.then(
              function success (a, b){
                alert('deleted');
                $scope.growPlans.splice($scope.growPlans.indexOf(growPlan), 1);
              },
              function error(a, b){
                alert('failed');
              }
            );
          };

        }
      ]
    );

    domReady(function () {
      angular.bootstrap(document, ['bpn.apps.admin.growPlans']);
    });
  }
);
