require([
    'angular',
    'domReady',
    'moment',
    'fe-be-utils',
    'angularUI',
    'angularUIBootstrap',
    'es5shim',
    '/assets/js/services/socket.js',
    'overlay'
    ],
function (angular, domReady, moment, feBeUtils) {
  'use strict';

  var calibrateApp = angular.module('bpn.apps.calibrate', ['ui', 'ui.bootstrap', 'bpn.services']);


  calibrateApp.config(
    [
      '$locationProvider',
      '$routeProvider',
      function($locationProvider, $routeProvider) {
        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix = '!';

        $routeProvider
          .when('/', {
            controller: 'bpn.controllers.calibrate.PH4',
            templateUrl: 'ph4.html'
          })
          .when('/ph7', {
            controller: 'bpn.controllers.calibrate.PH7',
            templateUrl: 'ph7.html'
          })
          .when('/ph10', {
            controller: 'bpn.controllers.calibrate.PH10',
            templateUrl: 'ph10.html'
          })
          .when('/done', {
            controller: 'bpn.controllers.calibrate.Done',
            templateUrl: 'done.html'
          })
          .otherwise({redirectTo:'/'}
        );
      }
    ]
  );


  calibrateApp.factory('sharedDataService', function(){
      return {
        waitingOn : '',
        deviceId : bpn.pageData.deviceId
      };
    }
  );


  calibrateApp.controller('bpn.controllers.calibrate.PH4',
    [
      '$scope',
      'sharedDataService',
      'bpn.services.socket',
      function($scope, sharedDataService, socket){
        $scope.sharedDataService = sharedDataService;
        
        $scope.showOverlay = function(){
          $scope.sharedDataService.waitingOn = bpn.utils.CALIB_MODES.PH_4;
          socket.emit('ready', { deviceId: $scope.sharedDataService.deviceId, mode: $scope.sharedDataService.waitingOn });
          $scope.$overlay.html("<h1>Calibrating pH 4...</h1>").show();
        };
      }
    ]
  );


  calibrateApp.controller('bpn.controllers.calibrate.PH7',
    [
      '$scope',
      'sharedDataService',
      'bpn.services.socket',
      function($scope, sharedDataService, socket){
        $scope.sharedDataService = sharedDataService;
        
        $scope.showOverlay = function(){
          $scope.sharedDataService.waitingOn = bpn.utils.CALIB_MODES.PH_7;
          socket.emit('ready', { deviceId: $scope.sharedDataService.deviceId, mode: $scope.sharedDataService.waitingOn });
          $scope.$overlay.html("<h1>Calibrating pH 7...</h1>").show();
        };
      }
    ]
  );


  calibrateApp.controller('bpn.controllers.calibrate.PH10',
    [
      '$scope',
      'sharedDataService',
      'bpn.services.socket',
      function($scope, sharedDataService, socket){
        $scope.sharedDataService = sharedDataService;
        
        $scope.showOverlay = function(){
          $scope.sharedDataService.waitingOn = bpn.utils.CALIB_MODES.PH_10;
          socket.emit('ready', { deviceId: $scope.sharedDataService.deviceId, mode: $scope.sharedDataService.waitingOn });
          $scope.$overlay.html("<h1>Calibrating pH 10...</h1>").show();
        }; 
      }
    ]
  );


  calibrateApp.controller('bpn.controllers.calibrate.Done',
    [
      '$scope',
      'sharedDataService',
      'bpn.services.socket',
      function($scope, sharedDataService, socket){
        $scope.sharedDataService = sharedDataService;
        
        
      }
    ]
  );

  
  calibrateApp.controller('bpn.controllers.calibrate.Main',
    [
      '$scope',
      '$filter',
      '$location',
      'bpn.services.socket',
      'sharedDataService',
      function ($scope, $filter, $location, socket, sharedDataService) {
        
        $scope.socket = socket;
        $scope.socket.connect('/calibrate');

        $scope.sharedDataService = sharedDataService;
        $scope.sharedDataService.waitingOn = '';
        $scope.$overlay = $('#overlay');
        
        $scope.socket.on('connect', function () {
          //console.log('connected');
          //socket.emit('ready', { deviceId: bpn.pages.calibrate.deviceId });
        });
        
        $scope.socket.on('device_calibration_response', function (data) {
          console.log('device_calibration_response', data);
          switch(data.mode){
            case bpn.utils.CALIB_MODES.PH_4:
              $scope.$overlay.hide();
              $location.path('/ph7');
              break;
            case bpn.utils.CALIB_MODES.PH_7:
              $scope.$overlay.hide();
              $location.path('/ph10');
              break;
            case bpn.utils.CALIB_MODES.PH_10:
              $scope.$overlay.hide();
              $location.path('/done');
              break;
          }
        });

        $scope.socket.on('error', function(err){
          console.log('error establishing socket connection', err);
        });

      }
    ]
  );


  domReady(function () {
    angular.bootstrap(document, ['bpn.apps.calibrate']);
  });

});
