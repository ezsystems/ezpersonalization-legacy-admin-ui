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
                    template: '<div class="row"> <div class="col-sm-2 col-sm-offset-5"><i class="fa-5x fa fa-refresh fa-spin"></i></div></div>',
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
                    template: '<div class="row"> <div class="col-sm-2 col-sm-offset-5"><i class="fa-5x fa fa-refresh fa-spin"></i></div></div>',
                    controller: function ($scope, paymentParams, $timeout, $state) {
                        console.log('params', paymentParams);
                        IteroJS.finalize(function (data) {
                            var params = {
                                contractid: data.ContractId,
                                customerid: data.CustomerId,
                                orderid: data.OrderId
                            };
                            $state.go('finished', params, {
                                location: false
                            });
                        }, function (error) {
                            $state.go('error', error, {
                                location: false
                            });
                        });
                    },
                    resolve: {
                        paymentParams: function ($location) {
                            return $location.search();
                        }
                    },

                })
                .state('error', {
                    url: '/error?errorCode',
                    template: '<div class="container"><div class="row"><error cause="cause"></error></div><div class="row"><div class="pull-right"><div class="col-xs-2 "><a class="btn btn-default" ui-sref="root" translate="restart_button"></a></div></div></div></div>',
                    controller: function ($scope, $stateParams) {
                        if (!$stateParams.errorCode instanceof Array) {
                            $scope.cause = [$stateParams.errorCode];
                        } else {
                            $scope.cause = $stateParams.errorCode;
                        }
                    }
                })
            
            ;
        }
        ]);