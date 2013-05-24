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

  var setupApp = angular.module('bpn.apps.setup.device', ['ngResource']);

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
            // resolve: {
            //   growPlan: ['GrowPlanLoader', function(GrowPlanLoader) {
            //     return GrowPlanLoader();
            //   }]
            // },
            templateUrl:'pair.html'
          })
          .otherwise({redirectTo:'/'});
      }
    ]
  );

  setupApp.factory('sharedDataService', function(){
      return {
        selectedWifiNetwork : {}
      }
  });
  
  setupApp.controller('bpn.controllers.setup.device.Connect',
    [
      '$scope',
      '$location',
      '$http',
      function($scope, $location, $http){
        

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
            }
          }); 
        };
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
        $scope.wifiForm = function() {
          var keys = $scope.bothKeys.split('|');
          sharedDataService.selectedWifiNetwork = $scope.selectedWifiNetwork;
          $scope.publicDeviceKey = keys[0];
          $scope.privateDeviceKey = keys[1];
          

          //if manual entry, update $scope.selectedWifiNetwork with manual values
          if($scope.selectedWifiNetwork.isOtherNetwork) {
            $scope.selectedWifiNetwork = {
              ssid: $scope.manualWifiNetworkSSID,
              securityMode: $scope.manualWifiNetworkSecurityMode
            }
          }

          // TODO : validate more

          if(keys.length == 2 && $scope.privateDeviceKey.length && $scope.publicDeviceKey.length) {
            $scope.postToDevice();
          }
        };

        $scope.postToDevice = function() {
          // Clean up data so that device can parse it
          // spaces must be replaced with '$'
          $scope.selectedWifiNetwork.deviceFriendlySsid = $scope.selectedWifiNetwork.ssid.replace(/ /g, '$');

          var postDataStringPlainText = 'SSID=' + $scope.selectedWifiNetwork.deviceFriendlySsid + '\n' +
            'PASS=' + $scope.wifiPass + '\n' +
            'MODE=' + $scope.selectedWifiNetwork.securityMode + '\n' +
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
        $scope.selectedWifiNetwork = sharedDataService.selectedWifiNetwork;
        
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
        $scope.selectedWifiNetwork = undefined;
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
