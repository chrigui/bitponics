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
            country: null
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
            country: null
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
        $scope.priceCollection = ['$scope.sharedDataService.baseStationQuantity','$scope.sharedDataService.priceSubtotal','$scope.sharedDataService.priceShipping','$scope.sharedDataService.priceTaxes'];
        
        $scope.updateOrderInfo = function () {
          // multiply device price by quantity
          $scope.sharedDataService.orderInfo.priceSubtotal = $scope.sharedDataService.orderInfo.priceTotal = $scope.sharedDataService.bitponicsProducts['HBIT0000001'].price * $scope.sharedDataService.orderInfo.baseStationQuantity; //Base Station V1 Device
          
          //add subtotals
          $scope.sharedDataService.orderInfo.priceTotal = $scope.sharedDataService.orderInfo.priceSubtotal +
            $scope.sharedDataService.orderInfo.priceTaxes + 
            $scope.sharedDataService.orderInfo.priceShipping;
          
          // format with currency symbol
          $scope.sharedDataService.orderInfo.priceSubtotal = $filter('currency')($scope.sharedDataService.orderInfo.priceSubtotal, '$');
          $scope.sharedDataService.orderInfo.priceTaxes = $filter('currency')($scope.sharedDataService.orderInfo.priceTaxes, '$');
          $scope.sharedDataService.orderInfo.priceShipping = $filter('currency')($scope.sharedDataService.orderInfo.priceShipping, '$');
          $scope.sharedDataService.orderInfo.priceTotal = $filter('currency')($scope.sharedDataService.orderInfo.priceTotal, '$');
          
        }

        $scope.$watchCollection('priceCollection', function () {
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
          $scope.sharedDataService.orderInfo.webServicePlan = 'WBIT0000002';
          $scope.sharedDataService.bitponicsProducts = bpn.products;
          
          // repopulate form
          if (bpn.tempUserInfo) {
            $scope.sharedDataService.orderInfo.baseStationQuantity = bpn.tempUserInfo.baseStationQuantity * 1;
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