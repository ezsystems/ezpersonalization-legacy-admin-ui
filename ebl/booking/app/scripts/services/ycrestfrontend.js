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
    function RestService($resource) {

       var restfrontend = $resource(baseUrl, {}, {
         getMe: {
             url: baseUrl + '/v3/registration/get_me',
             params: {'no-realm': 'true'},
         },

       });
       this.getMe = restfrontend.getMe;
       this.getBaseUrl = getBaseUrl;
    }

    // Public API for configuration
    this.setBaseUrl = function (url) {
      baseUrl = url;
    };

    this.getBaseUrl = getBaseUrl;

    // Method for instantiating
    this.$get = function () {
      var myInjector = angular.injector(["ng", "ngResource"]);
      var $http = myInjector.get("$http");
      var $resource = myInjector.get("$resource");
      
      return new RestService($resource);
    };
  });
