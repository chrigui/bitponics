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
  'bpn.services.device'
],
  function (angular, domReady, moment, feBeUtils) {
    'use strict';

    var app = angular.module('bpn.apps.admin.devices', ['bpn', 'ui', 'ui.bootstrap', 'ngRoute']);

    app.controller('bpn.controllers.admin.devices.Main', 
      [
        '$scope',
        '$http',
        '$q',
        'DeviceModel',
        function ($scope, $http, $q, DeviceModel) {
          $scope.devices = bpn.pageData.devices.map(function(device){
            return new DeviceModel(device); 
          });
          
        }
      ]
    );

    domReady(function () {
      angular.bootstrap(document, ['bpn.apps.admin.devices']);
    });
  }
);
