require([
  'angular',
  'domReady',
  'fe-be-utils',
  'angularResource',
  'es5shim',
  'angularUI',
  'angularUIBootstrap',
  'bpn',
  // 'facebook',
  'ngFacebook'
],
function (angular, domReady, feBeUtils) {
  'use strict';

  var profileApp = angular.module('bpn.apps.account.profile', ['bpn', 'ngResource', 'ui', 'ui.bootstrap', 'facebook']);
 
  profileApp.config(['$facebookProvider', function($facebookProvider) {
      $facebookProvider.init({
          appId: '260907493994161'
      });
  }]);

  profileApp.factory('sharedDataService', 
    [
      function(){
        return {
          activeOverlay : { is: undefined },
          modalOptions : {
            backdrop: true,
            backdropFade: true,
            dialogFade: true,
            dialogClass : 'overlay auto-size'
          }
        };
      }
    ]
  );
  
  profileApp.controller('bpn.controllers.account.profile.Main',
    [
      '$scope',
      '$filter',
      'sharedDataService',
      '$facebook',
      function ($scope, $filter, sharedDataService, $facebook) {

        $facebook.getLoginStatus().then(
            function(response) {
                console.info('getLoginStatus()')
                console.info(response);
            },
            function(response) {
                console.info('getLoginStatus()#2')
                console.info(response);
            }
        );

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
        $scope.enabled = false;

        $scope.enablePublishingToFacebook = function(checkbox) {
          //TODO: start using User service model to update permissions
          if (checkbox.enabled) {
            $facebook.login({ scope: 'publish_actions' }).then(

              function(response) {
                debugger;
                if (response.authResponse) {
                  // $scope.enabled = true;
                  // console.info('Welcome!  Fetching your information.... ');
                  // $facebook.api('/me').then(
                  //   function(response) {
                  //     console.info('Good to see you, ' + response.name + '.');
                  //   },
                  //   function(response) {
                  //     console.info('Bad to see you, ' + response.name + '.');
                  //   }
                  // );
                } else {
                  console.info('User cancelled login or did not fully authorize.');
                  $scope.enabled = false;
                }
              },
              function(response) {
                console.info('error fb');
                console.info(response);
                $scope.enabled = false;
              }
            );
          }
        }

        $scope.enablePublishingToFacebook();

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