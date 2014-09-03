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
    'ui.router',
    'ui.bootstrap.showErrors',
    'ui.bootstrap',
    'ngStorage'

  ])
  .run([ '$rootScope', '$state', '$stateParams',
    function ($rootScope, $state, $stateParams) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
    }
  ])
  .config(
    ['$stateProvider', '$urlRouterProvider', '$locationProvider', 
      function($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise("/?productCode=none");
        $stateProvider
       	.state("root", {
        url: "/?productCode",
          template: '<div class="row"><div class="col-sm-2 col-sm-offset-5"><i class="fa-5x fa fa-refresh fa-spin"></i></div></div>',
	  controller: "InitCtrl"
        })	
	.state("booking", {
          url: "/booking",
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
