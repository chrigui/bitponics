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


  // http://stackoverflow.com/a/15253892/117331
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
        $scope.maskedSerial;

        $scope.$watch('serial', function(){
          $scope.maskedSerial = $('#serial')[0].value.substring(0, 11);
        })

        $scope.sendSerialToServer = function() {
          $http.post("/setup", { 'serial': $scope.maskedSerial })
            .success(function (data) {
              if (typeof data === 'string'){
                data = JSON.parse(data);
              }
              $scope.key = data.combinedKey;
            });
        }

        $scope.openWifiPairingPage = function() {
          window.open('http://' + bpn.pageData.nextUrl, "_blank");

          $scope.pairingPending = true;

          $scope.socket.connect('/setup');
          $scope.socket.on('connect', function(){
            $scope.socket.emit('ready', { "serial" : $scope.serial } );
          })
          $scope.socket.on('keys', function (keys) {
            keys.forEach(function(key){
              if (key.serial === $scope.maskedSerial && key.verified){
                $scope.pairingComplete = true;
                $scope.socket.disconnect();
              }
            })
          });
          
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