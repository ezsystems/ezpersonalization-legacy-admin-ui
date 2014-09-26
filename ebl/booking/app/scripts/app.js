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
        'ycBookingApp.rest',
        'ngResource',
        'ngSanitize',
        'ui.router',
        'ui.bootstrap.showErrors',
        'ui.bootstrap',
        'ngStorage',
        'pascalprecht.translate',
        'translations',
        'creditCardInput'
    ])
    .run(['$rootScope', '$state', '$stateParams',
        function ($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

        }
        ])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$translateProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider, $translateProvider) {
            $translateProvider
                .registerAvailableLanguageKeys(['en', 'de'], {
                    'en_US': 'en',
                    'en_UK': 'en',
                    'de_DE': 'de',
                    'de_CH': 'de',
                    'de_AT': 'de'
                })
                .determinePreferredLanguage();
            $translateProvider.fallbackLanguage('en');
            $translateProvider.useMissingTranslationHandlerLog();

            $locationProvider.html5Mode(true);
//            $urlRouterProvider.when(/.*paymentReturn.*/, function ($location, $sessionStorage) {
//                $sessionStorage.paymentReturn = $location.search();
//                return '/paymentDone';
//            });
            $stateProvider
                .state('root', {
                    url: '/?productCode',
                    template: '<div class="row" > < div class = "col-sm-2 col-sm-offset-5" > < i class = "fa-5x fa fa-refresh fa-spin"></i></div></div>',
                    controller: 'InitCtrl'
                })
                .state('booking', {
                    url: '/booking',
                    templateUrl: 'views/booking.html',
                    controller: 'BookingCtrl'
                })
                .state('account', {
                    url: '/account',
                    templateUrl: 'views/account.html',
                    resolve: {
                        loginData: function (ycRestfrontend) {
                            var me = ycRestfrontend.getMe();
                            return me;
                        }
                    },
                    controller: 'AccountCtrl'
                })
                .state('checkout', {
                    url: '/checkout',
                    templateUrl: 'views/checkout.html',
                    controller: 'CheckoutCtrl'
                })
                .state('billing', {
                    url: '/billing',
                    templateUrl: 'views/billing.html',
                    controller: 'BillingCtrl'

                })
                .state('finished', {
                    url: '/finished/:customerid/:contractid/:orderid',
                    templateUrl: 'views/finished.html',
                    controller: 'FinishedCtrl'

                })
                .state('paymentDone', {
                    url: '/paymentDone',
                    controller: function ($scope, paymentParams) {
                        console.log('params', paymentParams);
                    },
                    resolve: {
                        paymentParams: function($location) {
                            return $location.search();
                        }
                    },
                    template: "Hello"

                });
        }
        ]);