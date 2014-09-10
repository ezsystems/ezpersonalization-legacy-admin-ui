'use strict';

/**
 * @ngdoc service
 * @name ycBookingApp.ycRestfrontend
 * @description
 * # ycRestfrontend
 * Provider in the ycBookingApp.
 */
angular.module('ycBookingApp.rest', ["ngResource"])
  .provider('ycRestfrontend', function () {

    // Private variables
    var baseUrl = '/api';
    function getBaseUrl() {
      return baseUrl;
    };
    // Private constructor
    function RestService($resource, $translate) {

       var restfrontend = $resource(baseUrl, {}, {
         getMe: {
             url: baseUrl + '/v3/registration/get_me',
             params: {'no-realm': 'true'},
         },
         getPlans: {
             url: baseUrl + '/v4/registration/get_product/:product_id',

         },

       });
       this.getMe = restfrontend.getMe;
       this.getBaseUrl = getBaseUrl;
       this.getPlans = function(productCode){
                             console.log($translate);
                             restfrontend.getPlans({'product_id': productCode,
                                                    'lang': $translate.use(),
                                                   });
                             };
    }

    // Public API for configuration
    this.setBaseUrl = function (url) {
      baseUrl = url;
    };

    this.getBaseUrl = getBaseUrl;

    // Method for instantiating
    this.$get = function ($resource, $translate) {
//      var myInjector = angular.injector(["ng", "ngResource", 'pascalprecht.translate']);
//      var $translate = myInjector.get("$translate");
//      var $resource = myInjector.get("$resource");
      
      return new RestService($resource, $translate);
    };
  });
