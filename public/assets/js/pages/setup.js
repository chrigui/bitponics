require([
  'angular',
  'domReady',
  // 'moment',
  // 'fe-be-utils',
  // 'view-models',
  'angularResource',
  // 'd3',
  'es5shim',
  // 'steps',
  // 'overlay'
],
// function (angular, domReady, moment, feBeUtils, viewModels) {
function (angular, domReady) {
  'use strict';

  var setupApp = angular.module('bpn.apps.setup', ['ngResource']);

  setupApp.controller('bpn.controllers.setup.Main',
    [
      '$scope',
      '$filter',
      '$http',
      function ($scope, $filter, $http) {
        $scope.serialServiceURL = undefined;
        $scope.serial = undefined;
        $scope.key = undefined;

        $scope.sendSerialToServer = function() {
          $http.post("/setup", { 'serial': $scope.serial })
            .success(function (data) {
              console.log(data);
              if (typeof data === 'string'){
                data = JSON.parse(data);
              }
              $scope.key = data.public + '|' + data.private;
            });
        }

        $scope.openWifiPairingPage = function() {
          window.open('http://' + bpn.pageData.nextUrl, "device");
        }
      }
    ]
  );

  setupApp.directive('selectOnClick', function () {
    return function (scope, element, attrs) {
        element.click(function () {
            element.select();
        });
    };
  });

  domReady(function () {
    angular.bootstrap(document, ['bpn.apps.setup']);
  });

});