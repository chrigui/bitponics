require([
  'angular',
  'domReady',
  'angularResource',
  'es5shim',
  'angularUI',
  '/assets/js/services/socket.js',
  '/assets/js/libs/angular/mask.js'
],
function (angular, domReady) {
  'use strict';

  var setupApp = angular.module('bpn.apps.setup', ['ui.mask', 'ngResource', 'bpn.services']);


  setupApp.directive('uppercase', function() {
     return {
       priority: 200, // give it higher priority than the input mask
       require: 'ngModel',
       link: function(scope, element, attrs, modelCtrl) {
          var uppercase = function(inputValue) {
             var upperCased = inputValue.toUpperCase()
             if(upperCased !== inputValue) {
                modelCtrl.$setViewValue(upperCased);
                modelCtrl.$render();
              }         
              return upperCased;
           }
           modelCtrl.$parsers.push(uppercase);
           uppercase(scope[attrs.ngModel]); 
       }
     };
  });

  setupApp.controller('bpn.controllers.setup.Main',
    [
      '$scope',
      '$filter',
      '$http',
      'bpn.services.socket',
      function ($scope, $filter, $http, socket) {
        $scope.serialServiceURL = undefined;
        $scope.serial = "";
        $scope.key = undefined;
        $scope.socket = socket;
        $scope.serialMask = "**-***-****";

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

          $scope.socket.connect('/setup');
          $scope.socket.on('device_calibration_response', function (data) {
          });
          $scope.socket.emit('ready');
        }

        $scope.$watch('serial', function(oldValue, newValue){
          //console.log($filter('uppercase')($scope.serial));
          //$scope.serial = $scope.serial.toUpperCase();
        });
      }
    ]
  );

  domReady(function () {
    angular.bootstrap(document, ['bpn.apps.setup']);
  });

});