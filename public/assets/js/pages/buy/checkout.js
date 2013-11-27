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
  'controller-nav'
],
function (angular, domReady, feBeUtils) {
  'use strict';

  var checkoutApp = angular.module('bpn.apps.buy.checkout', ['ngResource', 'ngRoute', 'ui', 'ui.bootstrap', 'bpn.controllers']).run(
    [
      '$rootScope',
      function($rootScope) {
        /**
         * Debugging Tools
         *
         * Allows you to execute debug functions from the view
         */
        $rootScope.log = function(variable) {
          console.log(variable);
        };
        $rootScope.alert = function(text) {
          alert(text);
        };
      }  
    ]
  );

  // checkoutApp.config(
  //   [
  //     '$locationProvider',
  //     '$routeProvider',
  //     function($locationProvider, $routeProvider) {
  //       $locationProvider.html5Mode(true);
  //       $locationProvider.hashPrefix = '!';

  //       $routeProvider
  //         .when('/', {
  //           controller: 'bpn.controllers.setup.device.Connect',
  //           templateUrl: 'connect.html'
  //         })
  //         .when('/wifi', {
  //           controller: 'bpn.controllers.setup.device.Wifi',
  //           templateUrl: 'wifi.html'
  //         })
  //         .when('/pair', {
  //           controller: 'bpn.controllers.setup.device.Pair',
  //           templateUrl:'pair.html'
  //         })
  //         .otherwise({redirectTo:'/'});
  //     }
  //   ]
  // );

  checkoutApp.factory('sharedDataService', function(){
      return {
        bitponicsProducts: {},
        orderInfo: {
          baseStationQuantity: 0,
          webServicePlan: null,
          priceSubtotal: 0,
          priceShipping: 0,
          priceTaxes: 0,
          priceTotal: 0,
          cardInfo: {
            number: null,
            cvv: null,
            expMonth: null,
            expYear: null
          },
          email: null,
          personalInfo: {
            firstName: null,
            lastName: null,
            streetAddress: null,
            extendedStreetAddress: null,
            locality: null,
            region: null,
            postalCode: null,
            country: "US"
          },
          shippingSameAsBilling: true,
          shippingInfo: {
            firstName: null,
            lastName: null,
            streetAddress: null,
            extendedStreetAddress: null,
            locality: null,
            region: null,
            postalCode: null,
            country: "US"
          }
        },
        activeOverlay : { is: undefined },
        modalOptions : {
          backdropFade: true,
          dialogFade: true,
          dialogClass : 'overlay auto-size'
        }
      };
  });
  
  checkoutApp.controller('bpn.controllers.buy.checkout.OrderInfo',
    [
      '$scope',
      '$filter',
      'sharedDataService',
      function($scope, $filter, sharedDataService){
        $scope.sharedDataService = sharedDataService;
        
        $scope.updateOrderInfo = function () {
          // multiply device price by quantity
          $scope.sharedDataService.orderInfo.priceSubtotal = $scope.sharedDataService.orderInfo.priceTotal = 
            (($scope.sharedDataService.bitponicsProducts[feBeUtils.PRODUCT_IDS["BPN_HARDWARE_BASE-STATION_1"]].price * $scope.sharedDataService.orderInfo.baseStationQuantity) + 
            ($scope.sharedDataService.orderInfo.ecSensor ? $scope.sharedDataService.bitponicsProducts[feBeUtils.PRODUCT_IDS["BPN_ACC_EC-PROBE"]].price : 0));
          
          //add subtotals
          $scope.sharedDataService.orderInfo.priceTotal = $scope.sharedDataService.orderInfo.priceSubtotal +
            $scope.sharedDataService.orderInfo.priceTaxes + 
            $scope.sharedDataService.orderInfo.priceShipping;
        }

        $scope.$watch("sharedDataService.orderInfo.personalInfo.country", function () {
          if ($scope.sharedDataService.orderInfo.personalInfo.country === "US"){
            $scope.sharedDataService.orderInfo.priceShipping = 15;
          } else {
            $scope.sharedDataService.orderInfo.priceShipping = 50;
          }
        });

        $scope.$watchCollection("[sharedDataService.orderInfo.baseStationQuantity,sharedDataService.orderInfo.ecSensor,sharedDataService.orderInfo.priceSubtotal,sharedDataService.orderInfo.priceShipping,sharedDataService.orderInfo.priceTaxes]", function () {
          $scope.updateOrderInfo();
        });

      }
    ]
  );

  checkoutApp.controller('bpn.controllers.buy.checkout.CCInfo',
    [
      '$scope',
      'sharedDataService',
      function($scope, sharedDataService){
        $scope.sharedDataService = sharedDataService;
      }
    ]
  );

  checkoutApp.controller('bpn.controllers.buy.checkout.PersonalInfo',
    [
      '$scope',
      'sharedDataService',
      function($scope, sharedDataService){
        $scope.sharedDataService = sharedDataService;
      }
    ]
  );

  checkoutApp.controller('bpn.controllers.buy.checkout.ShippingInfo',
    [
      '$scope',
      'sharedDataService',
      function($scope, sharedDataService){
        $scope.sharedDataService = sharedDataService;

        $scope.$watch('sharedDataService.orderInfo.personalInfo',
          function(){
            if (sharedDataService.orderInfo.shippingSameAsBilling){
              sharedDataService.orderInfo.shippingInfo = JSON.parse(JSON.stringify(sharedDataService.orderInfo.personalInfo));
            }
          },
          true
        );

        $scope.$watch('sharedDataService.orderInfo.shippingSameAsBilling',
          function(){
            if (sharedDataService.orderInfo.shippingSameAsBilling){
              sharedDataService.orderInfo.shippingInfo = JSON.parse(JSON.stringify(sharedDataService.orderInfo.personalInfo));
            }
          }
        );
      }
    ]
  );

  checkoutApp.controller('bpn.controllers.buy.checkout.Main',
    [
      '$scope',
      '$filter',
      'sharedDataService',
      function ($scope, $filter, sharedDataService) {
        $scope.sharedDataService = sharedDataService;

        $scope.init = function () {
          console.log('stuff')
          $scope.sharedDataService.orderInfo.baseStationQuantity = 1;
          $scope.sharedDataService.orderInfo.webServicePlan = 'BPN_WEB_PREMIUM_MONTHLY';
          $scope.sharedDataService.bitponicsProducts = bpn.products;
          
          // repopulate form
          if (bpn.tempUserInfo) {
            $scope.sharedDataService.orderInfo.baseStationQuantity = bpn.tempUserInfo.baseStationQuantity * 1;
            $scope.sharedDataService.orderInfo.ecSensor = bpn.tempUserInfo.ecSensor;
            $scope.sharedDataService.orderInfo.webServicePlan = bpn.tempUserInfo.webServicePlan;
            $scope.sharedDataService.orderInfo.email = bpn.tempUserInfo.email;
            $scope.sharedDataService.orderInfo.personalInfo = bpn.tempUserInfo.personalInfo;
            $scope.sharedDataService.orderInfo.shippingInfo = bpn.tempUserInfo.shippingInfo;
            $scope.sharedDataService.orderInfo.shippingSameAsBilling = bpn.tempUserInfo.shippingSameAsBilling;

            console.log(bpn.tempUserInfo);
          }
        }
        
      }
    ]
  );
  
  checkoutApp.directive('integer', function() {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$parsers.unshift(function(viewValue, maxLength) {
          var INTEGER_REGEXP = /^\-?\d*$/;
          if (INTEGER_REGEXP.test(viewValue)) {
            // it is valid
            ctrl.$setValidity('integer', true);
            return viewValue;
          } else {
            // it is invalid, return undefined (no model update)
            ctrl.$setValidity('integer', false);
            return undefined;
          }
        });
      }
    };
  });

  domReady(function () {
    angular.bootstrap(document, ['bpn.apps.buy.checkout']);
  });

  

});