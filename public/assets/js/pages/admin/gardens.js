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
  'services-socket',
  'controller-nav',
  'bpn.services.garden'
],
  function (angular, domReady, moment, feBeUtils) {
    'use strict';

    var adminGardensApp = angular.module('bpn.apps.admin.gardens', ['ui', 'ui.bootstrap', 'bpn.services', 'bpn.controllers', 'ngRoute']);

    adminGardensApp.controller('bpn.controllers.admin.gardens.Main', 
      [
        '$scope',
        '$http',
        '$q',
        'GardenModel',
        function ($scope, $http, $q, GardenModel) {
          $scope.gardens = bpn.pageData.gardens;
          $scope.GardenModel = GardenModel;

          $scope.deleteGarden = function(garden){
            console.log("DELETING ", garden);

            var deleteRequest = GardenModel.delete({ id: garden._id });
            //console.log('deleteRequest', deleteRequest);
            deleteRequest.$promise.then(
              function success (a, b){
                alert('deleted');
                $scope.gardens.splice($scope.gardens.indexOf(garden), 1);
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
      angular.bootstrap(document, ['bpn.apps.admin.gardens']);
    });
  }
);
