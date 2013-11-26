require([
  'angular',
  'domReady',
  'moment',
  'fe-be-utils',
  'angularRoute',
  'angularUI',
  'angularUIBootstrap',
  'es5shim',
  'bpn.services.socket',
  'overlay',
  'controller-nav'
  ],
function (angular, domReady, moment, feBeUtils) {
  'use strict';

  var calibrateApp = angular.module('bpn.apps.calibrate', ['ngRoute', 'ui', 'ui.bootstrap', 'bpn.controllers', 'bpn.services']);


  calibrateApp.config(
    [
      '$locationProvider',
      '$routeProvider',
      function($locationProvider, $routeProvider) {
        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix = '!';

        $routeProvider
          .when('/', {
            controller: 'bpn.controllers.calibrate.Select',
            templateUrl: 'select.html'
          })
          .when('/ph', {
            controller: 'bpn.controllers.calibrate.PH_7',
            templateUrl: 'ph-7.html'
          })
          .when('/ph-4', {
            controller: 'bpn.controllers.calibrate.PH_4',
            templateUrl: 'ph-4.html'
          })
          .when('/ph-10', {
            controller: 'bpn.controllers.calibrate.PH_10',
            templateUrl: 'ph-10.html'
          })
          .when('/ph-done', {
            controller: 'bpn.controllers.calibrate.Ph_Done',
            templateUrl: 'ph-done.html'
          })
          .when('/ec', {
            controller: 'bpn.controllers.calibrate.EC_DRY',
            templateUrl: 'ec-dry.html'
          })
          .when('/ec-hi', {
            controller: 'bpn.controllers.calibrate.EC_HI',
            templateUrl: 'ec-hi.html'
          })
          .when('/ec-lo', {
            controller: 'bpn.controllers.calibrate.EC_LO',
            templateUrl: 'ec-lo.html'
          })
          .when('/ec-done', {
            controller: 'bpn.controllers.calibrate.EC_Done',
            templateUrl: 'ec-done.html'
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



  calibrateApp.controller('bpn.controllers.calibrate.PH_7',
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


  calibrateApp.controller('bpn.controllers.calibrate.PH_4',
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


  calibrateApp.controller('bpn.controllers.calibrate.PH_10',
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


  calibrateApp.controller('bpn.controllers.calibrate.Ph_Done',
    [
      '$scope',
      'sharedDataService',
      'bpn.services.socket',
      function($scope, sharedDataService, socket){
        $scope.sharedDataService = sharedDataService;
        
        $scope.sharedDataService.waitingOn = bpn.utils.CALIB_MODES.PH_DONE;
        socket.emit('ready', { deviceId: $scope.sharedDataService.deviceId, mode: $scope.sharedDataService.waitingOn });
      }
    ]
  );

  

  calibrateApp.controller('bpn.controllers.calibrate.EC_DRY',
    [
      '$scope',
      'sharedDataService',
      'bpn.services.socket',
      function($scope, sharedDataService, socket){
        $scope.sharedDataService = sharedDataService;
        
        $scope.showOverlay = function(){
          $scope.sharedDataService.waitingOn = bpn.utils.CALIB_MODES.EC_DRY;
          socket.emit('ready', { deviceId: $scope.sharedDataService.deviceId, mode: $scope.sharedDataService.waitingOn });
          $scope.$overlay.html("<h1>Calibrating EC-Dry...</h1>").show();
        };
      }
    ]
  );


  calibrateApp.controller('bpn.controllers.calibrate.EC_HI',
    [
      '$scope',
      'sharedDataService',
      'bpn.services.socket',
      function($scope, sharedDataService, socket){
        $scope.sharedDataService = sharedDataService;
        
        $scope.showOverlay = function(){
          $scope.sharedDataService.waitingOn = bpn.utils.CALIB_MODES.EC_HI;
          socket.emit('ready', { deviceId: $scope.sharedDataService.deviceId, mode: $scope.sharedDataService.waitingOn });
          $scope.$overlay.html("<h1>Calibrating EC-3000&#956;s...</h1>").show();
        };
      }
    ]
  );


  calibrateApp.controller('bpn.controllers.calibrate.EC_LO',
    [
      '$scope',
      'sharedDataService',
      'bpn.services.socket',
      function($scope, sharedDataService, socket){
        $scope.sharedDataService = sharedDataService;
        
        $scope.showOverlay = function(){
          $scope.sharedDataService.waitingOn = bpn.utils.CALIB_MODES.EC_LO;
          socket.emit('ready', { deviceId: $scope.sharedDataService.deviceId, mode: $scope.sharedDataService.waitingOn });
          $scope.$overlay.html("<h1>Calibrating EC-200&#956;s...</h1>").show();
        };
      }
    ]
  );


  calibrateApp.controller('bpn.controllers.calibrate.EC_Done',
    [
      '$scope',
      'sharedDataService',
      'bpn.services.socket',
      function($scope, sharedDataService, socket){
        $scope.sharedDataService = sharedDataService;
        
        $scope.sharedDataService.waitingOn = bpn.utils.CALIB_MODES.EC_DONE;
        socket.emit('ready', { deviceId: $scope.sharedDataService.deviceId, mode: $scope.sharedDataService.waitingOn });
      }
    ]
  );


  calibrateApp.controller('bpn.controllers.calibrate.Select',
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
          switch(data.mode){
            // ph: 7, then 4, then 10
            case bpn.utils.CALIB_MODES.PH_7:
              $scope.$overlay.hide();
              $location.path('/ph-4');
              break;
            case bpn.utils.CALIB_MODES.PH_4:
              $scope.$overlay.hide();
              $location.path('/ph-10');
              break;
            case bpn.utils.CALIB_MODES.PH_10:
              $scope.$overlay.hide();
              $location.path('/ph-done');
              break;
            // ec: dry, then hi, then lo
            case bpn.utils.CALIB_MODES.EC_DRY:
              $scope.$overlay.hide();
              $location.path('/ec-hi');
              break;
            case bpn.utils.CALIB_MODES.EC_HI:
              $scope.$overlay.hide();
              $location.path('/ec-lo');
              break;
            case bpn.utils.CALIB_MODES.EC_LO:
              $scope.$overlay.hide();
              $location.path('/ec-done');
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
