/**
 * Main file for /grow-plans/:id
 *
 * Depends on following globals:
 * - bpn
 * - bpn.user
 */
require([
  'angular',
  'domReady',
  'view-models',
  'moment',
  'fe-be-utils',
  'es5shim',
  'angularUI',
  'angularUIBootstrap',
  'angularRoute',
  'bpn',
  'bpn.directives.graphs',
  'bpn.services.user',
  'bpn.services.garden'
],
function (angular, domReady, viewModels, moment, feBeUtils) {
  'use strict';

  var app = angular.module('bpn.apps.profiles', ['bpn', 'ngRoute', 'ui', 'ui.bootstrap']);



  app.controller('bpn.controllers.profiles.Main', [
    '$scope',
    '$route',
    'UserModel',
    'GardenModel',
    function($scope, $route, UserModel, GardenModel){
      console.log('$route.current', $route.current)
      $scope.user = UserModel.get( { id : bpn.pageData.profileId }, 
        function (user) {
        }, 
        function() {
        }
      );

      $scope.userGardenResults = GardenModel.query(
        { 
          where : JSON.stringify({ 'users' : bpn.pageData.profileId }),
          select : 'name,startDate'
        },
        function success(data){
          console.log(data);
        }
      );
    }
  ]);


  domReady(function () {
    angular.bootstrap(document, ['bpn.apps.profiles']);
  });

  return app;
});