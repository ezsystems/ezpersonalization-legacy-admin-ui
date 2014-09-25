/**
 * @ngdoc service
 * @name ycBookingApp.ycRestfrontend
 * @description
 * # ycRestfrontend
 * Provider in the ycBookingApp.
 */
angular.module('ycBookingApp.rest', ['ngResource'])
    .provider('ycRestfrontend', function () {
        'use strict';
        // Private variables
        var baseUrl = '/api';

        function getBaseUrl() {
            return baseUrl;
        }
        // Private constructor
        function RestService($resource, $translate, $location, $window) {

            var restfrontend = $resource(baseUrl, {}, {
                getMe: {
                    url: baseUrl + '/v4/profile/get_me',
                    params: {
                        'no-realm': 'true'
                    },
                    cache: true
                },
                getPlans: {
                    url: baseUrl + '/v4/registration/get_sister_products/:product_id',
                    isArray: true,
                    cache: true
                },
                updateProfile: {
                    url: baseUrl + '/v4/profile/update_local_profile/:provider/:user_id',
                    method: 'POST',
                    params: {provider: '@provider',
                             user_id: '@user_id'
                            }
                }

            });

            function redirect() {
                $window.location.href = '/login.html?returnUrl=' + $window.location; //$location.url();//'/login.html' + $location.search();
            }

            this.getMe = function () {
                return restfrontend.getMe(function () {}, redirect);
            };
            this.updateProfile = restfrontend.updateProfile;
            this.getBaseUrl = getBaseUrl;
            this.getPlans = function (productCode) {
                return restfrontend.getPlans({
                    'product_id': productCode,
                    'lang': $translate.use()
                });
            };

            this.redirectToLogin = redirect;
        }

        // Public API for configuration
        this.setBaseUrl = function (url) {
            baseUrl = url;
        };


        this.getBaseUrl = getBaseUrl;

        // Method for instantiating
        this.$get = function ($resource, $translate, $location, $window) {
            //      var myInjector = angular.injector(["ng", "ngResource", 'pascalprecht.translate']);
            //      var $translate = myInjector.get("$translate");
            //      var $resource = myInjector.get("$resource");

            return new RestService($resource, $translate, $location, $window);
        };
    });