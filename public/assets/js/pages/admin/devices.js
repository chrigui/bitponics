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

    var productionSerials = [
      'WD-301-JPZF',
      'WD-301-8CIP',
      'WD-301-TPRP',
      'WD-301-YJ3S',
      'WD-301-1PQE',
      'WD-301-NT6Q',
      'WD-301-CW9W',
      'WD-301-C674',
      'WD-301-AVZ1',
      'WD-301-SXXM',
      'WD-301-U236',
      'WD-301-BD4V',
      'WD-301-NIQV',
      'WD-301-A74T',
      'WD-301-95XI',
      'WD-301-P1GT',
      'WD-301-T4GJ',
      'WD-301-CPBD',
      'WD-301-PKJ3',
      'WD-301-43CS',
      'WD-301-R7KV',
      'WD-301-2CSC',
      'WD-301-FM7L',
      'WD-301-KUJ2',
      'WD-301-HTEZ',
      'WD-301-AWNM',
      'WD-301-SH2A',
      'WD-301-EXEW',
      'WD-301-LMXA',
      'WD-301-GVPY',
      'WD-301-WJS2',
      'WD-301-2EAR',
      'WD-301-O6BJ',
      'WD-301-29O9',
      'WD-301-67YO',
      'WD-301-WX1B',
      'WD-301-N21S',
      'WD-301-7V65',
      'WD-301-CO2L',
      'WD-301-JOM5',
      'WD-301-MISD',
      'WD-301-7QX6',
      'WD-301-3TV4',
      'WD-301-TS4C',
      'WD-301-DFLW',
      'WD-301-0HPO',
      'WD-301-15CT',
      'WD-301-7PWU',
      'WD-301-CI1T',
      'WD-301-BPTA',
      'WD-301-WTHY',
      'WD-301-8QIT',
      'WD-301-ADV8',
      'WD-301-RJJW',
      'WD-301-NDDF',
      'WD-301-4BT5',
      'WD-301-III6',
      'WD-301-T2OL',
      'WD-301-G3ML',
      'WD-301-216V',
      'WD-301-8O3K',
      'WD-301-Q1G8',
      'WD-301-8V0L',
      'WD-301-4ZAR',
      'WD-301-QVF7',
      'WD-301-24YX',
      'WD-301-2966',
      'WD-301-MO9D',
      'WD-301-8X3E',
      'WD-301-9MY1',
      'WD-301-53D1',
      'WD-301-TKES',
      'WD-301-5UL6',
      'WD-301-4TL9',
      'WD-301-S1YP',
      'WD-301-SQ7G',
      'WD-301-63J2',
      'WD-301-LHXO',
      'WD-301-BEM1',
      'WD-301-F319',
      'WD-301-3F14',
      'WD-301-N4H3',
      'WD-301-PQKP',
      'WD-301-SVME',
      'WD-301-GO1C',
      'WD-301-5BS4',
      'WD-301-L2C3',
      'WD-301-A1VL',
      'WD-301-09NA',
      'WD-301-OWPN',
      'WD-301-1M9Y',
      'WD-301-QFDB',
      'WD-301-QTET',
      'WD-301-CHC8',
      'WD-301-GY0E',
      'WD-301-JFS5',
      'WD-301-8MGW',
      'WD-301-TGV7',
      'WD-301-3SAW',
      'WD-301-T8YD',
    ];

    app.controller('bpn.controllers.admin.devices.AddDevice', 
      [
        '$scope',
        '$http',
        '$q',
        'DeviceModel',
        function ($scope, $http, $q, DeviceModel) {
          $scope.submit = function(){
            console.log($scope.macAddress, $scope.serial, this);
          };
        }
      ]
    );

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
          
          $scope.devicesBySerial = {};
          $scope.devices.forEach(function(device){
            $scope.devicesBySerial[device.serial] = device;
          })

          $scope.availableSerials = [];
          productionSerials.forEach(function(serial){
            if (!$scope.devicesBySerial[serial]){
              $scope.availableSerials.push(serial);
            }
          });

          console.log($scope.availableSerials)

        }
      ]
    );

    domReady(function () {
      angular.bootstrap(document, ['bpn.apps.admin.devices']);
    });
  }
);
