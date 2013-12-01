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
  'bpn.services.growSystem',
  'lvl.directives.fileUpload'
],
  function (angular, domReady, moment, feBeUtils) {
    'use strict';

    var app = angular.module('bpn.apps.admin.growSystems', ['bpn', 'ui', 'ui.bootstrap', 'ngRoute', 'lvl.directives.fileupload']);

    app.controller('bpn.controllers.admin.growSystems.Main', 
      [
        '$scope',
        '$http',
        '$q',
        'GrowSystemModel',
        function ($scope, $http, $q, GrowSystemModel) {
          $scope.growSystems = bpn.pageData.growSystems;
          $scope.GrowSystemModel = GrowSystemModel;



          $scope.delete = function(growSystem){
            console.log("DELETING ", growSystem);

            var deleteRequest = GrowSystemModel.delete({ id: growSystem._id });
            deleteRequest.$promise.then(
              function success (a, b){
                alert('deleted');
                $scope.growSystems.splice($scope.growSystems.indexOf(growSystem), 1);
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
      angular.bootstrap(document, ['bpn.apps.admin.growSystems']);
    });
  }
);
