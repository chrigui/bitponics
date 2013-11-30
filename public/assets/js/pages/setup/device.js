require([
  'angular',
  'domReady',
  'fe-be-utils',
  'angularResource',
  'es5shim',
  'angularRoute',
  'angularUI',
  'angularUIBootstrap',
  'overlay',
  'bpn'
],
function (angular, domReady, feBeUtils) {
  'use strict';

  var setupApp = angular.module('bpn.apps.setup.device', ['bpn', 'ngResource', 'ngRoute', 'ui', 'ui.bootstrap']);

  setupApp.config(
    [
      '$locationProvider',
      '$routeProvider',
      function($locationProvider, $routeProvider) {
        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix = '!';

        $routeProvider
          .when('/', {
            controller: 'bpn.controllers.setup.device.Connect',
            templateUrl: 'connect.html'
          })
          .when('/wifi', {
            controller: 'bpn.controllers.setup.device.Wifi',
            templateUrl: 'wifi.html'
          })
          .when('/pair', {
            controller: 'bpn.controllers.setup.device.Pair',
            templateUrl:'pair.html'
          })
          .otherwise({redirectTo:'/'});
      }
    ]
  );

  setupApp.factory('sharedDataService', function(){
      return {
        selectedWifiNetwork : {},
        activeOverlay : { is: undefined },
        modalOptions : {
          backdropFade: true,
          dialogFade: true,
          dialogClass : 'overlay auto-size'
        }
      };
  });
  
  setupApp.controller('bpn.controllers.setup.device.Connect',
    [
      '$scope',
      '$location',
      '$http',
      'sharedDataService',
      function($scope, $location, $http, sharedDataService){
        $scope.sharedDataService = sharedDataService;
        $scope.connect = function(){
          
          $.ajax({
            url : $scope.deviceUrl,
            timeout : 5000,
            success : function (data) {
              console.log(data);
              if (typeof data === 'string'){
                data = JSON.parse(data);
              }

              // Data will be in the following form:
              /*
              //  row count, Security Mode, SSID
              { 
                “mac”: “00:06:66:72:11:cf”,
                “networks”:  [ 
                  “01,01,5HMV5”,
                  “02,03,55378008”
                ]
              }
              */
              $scope.dataToPostAfterSuccess.deviceMacAddress = data.mac.replace(/:/g, '');
              
              $.each(data.networks, function(index, networkString){
                var parts = networkString.split(','),
                  ssid = parts[2],
                  securityModeKey = parts[1];
                
                $scope.scannedWifiNetworks.push({
                  ssid : ssid, 
                  securityMode : $scope.securityModeMap[securityModeKey]
                });
              });

              $scope.scannedWifiNetworks.push({ ssid: "Join Other Network...", securityMode: null, isOtherNetwork: true });

              $scope.scannedWifiNetworks.sort(function(a, b){
                return ((a.ssid < b.ssid) ? -1 : 1);
              });

              $location.path("/wifi");
              $scope.$apply();
            },
            error : function (data, textStatus) {
              $scope.$apply(function() {
                $scope.sharedDataService.activeOverlay = { is: 'ErrorOverlay' };
              });
            }
          }); 
        };
      }
    ]
  );

  setupApp.controller('bpn.controllers.setup.device.ErrorOverlay',
    [
      '$scope',
      'sharedDataService',
      function($scope, sharedDataService) {

        $scope.sharedDataService = sharedDataService;

        $scope.close = function() {
          $scope.sharedDataService.activeOverlay.is = undefined;
        }

      }
    ]
  );

  setupApp.controller('bpn.controllers.setup.device.Wifi',
    [
      '$scope',
      '$location',
      '$http',
      'sharedDataService',
      function($scope, $location, $http, sharedDataService){
        



        $scope.submitWifiForm = function() {
          var keys = $scope.bothKeys.split(feBeUtils.COMBINED_DEVICE_KEY_SPLITTER);
          //sharedDataService.selectedWifiNetwork = $scope.selectedWifiNetwork;
          $scope.publicDeviceKey = keys[0];
          $scope.privateDeviceKey = keys[1];
          

          //if manual entry, update $scope.selectedWifiNetwork with manual values
          if($scope.sharedDataService.selectedWifiNetwork.isOtherNetwork) {
            $scope.sharedDataService.selectedWifiNetwork.ssid = $scope.manualWifiNetworkSSID;
            $scope.sharedDataService.selectedWifiNetwork.securityMode = $scope.manualWifiNetworkSecurityMode;
          }

          // TODO : validate more

          if(keys.length == 2 && $scope.privateDeviceKey.length && $scope.publicDeviceKey.length) {
            $scope.postToDevice();
          }
        };

        $scope.postToDevice = function() {
          // Clean up data so that device can parse it
          // spaces must be replaced with '$'
          $scope.sharedDataService.selectedWifiNetwork.deviceFriendlySsid = $scope.sharedDataService.selectedWifiNetwork.ssid.replace(/ /g, '$');

          var postDataStringPlainText = 'SSID=' + $scope.sharedDataService.selectedWifiNetwork.deviceFriendlySsid + '\n' +
            'PASS=' + $scope.wifiPass + '\n' +
            'MODE=' + $scope.sharedDataService.selectedWifiNetwork.securityMode + '\n' +
            'SKEY=' + $scope.privateDeviceKey + '\n' +
            'PKEY=' + $scope.publicDeviceKey;

          console.log('Posting to device', postDataStringPlainText);

          $.ajax({
            type : "POST",
            url : $scope.deviceUrl,
            processData : false,
            data : postDataStringPlainText,
            success : function(data){
              console.log(data);
              $location.path("/pair");
              $scope.$apply();
            },
            error: function(jqXHR, textStatus, error){
              console.log('error', jqXHR, textStatus, error);
              $scope.$apply();
            }
          });
        };
      }
    ]
  );

  setupApp.controller('bpn.controllers.setup.device.Pair',
    [
      '$scope',
      '$location',
      '$http',
      'sharedDataService',
      function($scope, $location, $http, sharedDataService){
        //$scope.selectedWifiNetwork = sharedDataService.selectedWifiNetwork;
        
        // Not needed now?
        // $scope.submitDeviceInfo = function(){
        //   // e.preventDefault();
        //   // TODO : show spinner
        //   // $.ajax({
        //   //   url: '/setup',
        //   //   type: 'POST',
        //   //   contentType : 'application/json; charset=utf-8',
        //   //   dataType: 'json',
        //   //   data: JSON.stringify($scope.dataToPostAfterSuccess),
        //   //   processData : false,
        //   //   success: function(data){
        //   //     console.log(data);
        //   //     $scope.pairingComplete = true;
        //   //   },
        //   //   error: function(jqXHR, textStatus, error){
        //   //     console.log('error', jqXHR, textStatus, error);
        //   //     // TODO retry a certain number of times
        //   //   }
        //   // });
        //   $http.post('/setup/device', JSON.stringify($scope.dataToPostAfterSuccess))
        //     .success(function (data) {
        //       console.log(data);
        //       $scope.pairingComplete = true;
        //     })
        //     .error(function(jqXHR, textStatus, error){
        //       console.log('error', jqXHR, textStatus, error);
        //       // TODO retry a certain number of times
        //     })
        // };
      }
    ]
  );

  setupApp.controller('bpn.controllers.setup.device.Main',
    [
      '$scope',
      '$filter',
      'sharedDataService',
      function ($scope, $filter, sharedDataService) {
        $scope.publicDeviceKey = undefined;
        $scope.privateDeviceKey = undefined;
        $scope.bothKeys = undefined;
        /**
         * Format for wifi network objects:
         * { ssid : string, securityMode : string }
         */
        $scope.wifiPass = undefined;
        $scope.manualWifiNetworkSSID = undefined;
        $scope.manualWifiNetworkSecurityMode = undefined;
        $scope.securityModeOptions = {
          'WPA' : 'WPA_MODE',
          'WEP' : 'WEP_MODE',
          'NONE' : 'NONE'
        };
        $scope.securityModeMap = {
          '00' : $scope.securityModeOptions['WPA'],
          '01' : $scope.securityModeOptions['WEP'],
          '02' : $scope.securityModeOptions['WPA'],
          '03' : $scope.securityModeOptions['WPA'],
          '04' : $scope.securityModeOptions['WPA'],
          '05' : $scope.securityModeOptions['NONE'],
          '06' : $scope.securityModeOptions['WPA'],
          '08' : $scope.securityModeOptions['WPA']
        };

        $scope.deviceUrl = 'http://169.254.1.1/';
        $scope.devicePostFormat = 'SSID={{SSID}}\nPASS={{PASS}}\nMODE={{MODE}}\nSKEY={{SKEY}}\nPKEY={{PKEY}}';
        $scope.dataToPostAfterSuccess = {
          deviceMacAddress : '',
          publicDeviceKey : $scope.publicDeviceKey
        };
        $scope.scannedWifiNetworks = [];
        $scope.connectToDeviceRetryTimer = 60000;

      }
    ]
  );

  domReady(function () {
    angular.bootstrap(document, ['bpn.apps.setup.device']);
  });

  

});
