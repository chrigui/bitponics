/**
 * Default main file
 *
 * Placeholder until a page gets its own main file created
 *
 * Depends on following globals:
 * - bpn.user
 */
require([
  'angular',
  'domReady',
  'bpn.controllers.nav',
  'angularResource',
  'angularRoute'
  ],
  function (angular, domReady, moment, feBeUtils, viewModels, d3) {
    'use strict';
    var app = angular.module('bpn.apps.default', ['bpn', 'ngRoute']);
    domReady(function () {
      angular.bootstrap(document, ['bpn.apps.default']);
    });
  }
);