'use strict';

/**
 * @ngdoc overview
 * @name ycBookingApp
 * @description
 * # ycBookingApp
 *
 * Main module of the application.
 */
angular
  .module('ycBookingApp', [
    'ngResource',
    'ngSanitize',
    'ui.router'
  ])
  .run([ '$rootScope', '$state', '$stateParams',
    function ($rootScope, $state, $stateParams) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
    }
  ])
  .config(
    ['$stateProvider', '$urlRouterProvider',
      function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider
        .when('/booking?productCode', '/booking/:productCode')
        .otherwise('/booking');
        $stateProvider
	
	.state("booking", {
          url: "/booking/:productCode",
          templateUrl: "views/booking.html"
        })
        .state("account", {
          url: "/account",
          templateUrl: "views/account.html"
        })
        .state("checkout", {
          url: "/checkout",
          templateUrl: "views/checkout.html"
        })
        .state("billing", {
          url: "/billing",
          templateUrl: "views/billing.html"
        })
      }
    ]);
