require([
  'angular',
  'domReady',
  'view-models',
  'fe-be-utils',
  'angularResource',
  'es5shim',
  'angularUI',
  'angularUIBootstrap',
  'bpn',
  // 'facebook',
  'ngFacebook',
  'bpn.services.user'
],
function (angular, domReady, viewModels, feBeUtils) {
  'use strict';

  var profileApp = angular.module('bpn.apps.account.profile', ['bpn', 'ngResource', 'ui', 'ui.bootstrap', 'facebook']);


  profileApp.config(['$facebookProvider', function($facebookProvider) {
      $facebookProvider.init({
          appId: '260907493994161'
      });
  }]);

  profileApp.factory('sharedDataService', 
    [
      'UserModel',
      function(UserModel){
        var sharedData = {
          activeOverlay : { is: undefined },
          modalOptions : {
            backdrop: true,
            backdropFade: true,
            dialogFade: true,
            dialogClass : 'overlay auto-size'
          }
        };

        sharedData.user = viewModels.initUserViewModel(new UserModel(bpn.user));

        return sharedData;
      }
    ]
  );
  
  profileApp.controller('bpn.controllers.account.profile.Main',
    [
      '$scope',
      '$filter',
      'sharedDataService',
      '$facebook',
      'UserModel',
      function ($scope, $filter, sharedDataService, $facebook, UserModel) {

        // $facebook.getLoginStatus().then(
        //     function(response) {
        //         console.info('getLoginStatus()')
        //         console.info(response);
        //     },
        //     function(response) {
        //         console.info('getLoginStatus()#2')
        //         console.info(response);
        //     }
        // );

        // $scope.$on('facebook.auth.authResponseChange', function(response) {
        //     console.info('facebook.auth.authResponseChange');
        //     console.info(response);
        // });
      }
    ]
  );
  
  profileApp.controller('bpn.controllers.account.profile.PostToFacebook',
    [
      '$scope',
      'sharedDataService',
      '$facebook',
      function ($scope, sharedDataService, $facebook) {
        $scope.sharedDataService = sharedDataService;
        $scope.user = $scope.sharedDataService.user;
        $scope.enabled = typeof $scope.user.socialPreferences !== 'undefined' && 
                          $scope.user.socialPreferences.facebook && 
                          $scope.user.socialPreferences.facebook.permissions &&
                          $scope.user.socialPreferences.facebook.permissions.publish;


        $scope.enablePublishingToFacebook = function(checkbox) {
          $scope.setPublishPermission(checkbox.enabled);
        };

        $scope.setPublishPermission = function(enable) {
          var method,
              setAndSave = function(user, enable, accessToken) {
                $scope.enabled = user.socialPreferences.facebook.permissions.publish = enable;
                user.socialPreferences.facebook.accessToken = accessToken;
                user.$save();
              };

          if (enable) {
            method = 'POST';
            $facebook.login({ scope: 'publish_actions' }).then(
              function(response) {
                if (response.authResponse) {
                  // $facebook.api('/me/permissions', method).then(
                  console.info(response);
                  setAndSave($scope.user, true, response.authResponse.accessToken);
                } else {
                  console.info('User cancelled login or did not fully authorize.');
                  setAndSave($scope.user, false);
                }
              },
              function(response) {
                console.info('Login error so do not assume we have permission.');
                setAndSave($scope.user, false);
              }
            );
          } else {
            method = 'DELETE';
            $facebook.login().then(
              function(response) {
                $facebook.api('/me/permissions/publish_actions', method).then(
                  function(response) {
                    console.info('DELETE /me/permissions/publish_actions');
                    console.info(response);
                    setAndSave($scope.user, false);
                  },
                  function(response) {
                    console.info('Bad to see you, ' + response.name + '.');
                    setAndSave($scope.user, false);
                  }
                );
              }
            );
          }
        }

      }
    ]
  );

  domReady(function () {
    angular.bootstrap(document, ['bpn.apps.account.profile']);


    //legacy
    //TODO: make directive
    var container = $('body'),
        initEventHandlers;

    $('#timezone-image').timezonePicker({
      target: '#country_timezone',
      countryTarget: '#locale_timezone'
    });
    
    initEventHandlers = function() {
        container.on('click', '#detect', function(e){
            e.preventDefault();
            $('#timezone-image').timezonePicker('detectLocation', {
                success: function(p) {
                    console.log('success')
                    console.log(p)
                },
                error: function(p) {
                    console.log('error')
                    console.log(p)
                },
                complete: function(p) {
                    console.log('complete')
                    console.log(p)
                }
            });
        });     
    }
    
    initEventHandlers();
    $('#country_timezone').val(bpn.user.timezone);
    $('#locale_timezone').val(bpn.user.locale.territory);

  });
});