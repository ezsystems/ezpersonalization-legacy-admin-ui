'use strict';

/**
 * @ngdoc function
 * @name ycBookingApp.controller:BillingCtrl
 * @description
 * # BillingCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
  .controller('BillingCtrl', function ($scope, $resource) {
      var countries = $resource('assets/countries.json',{},{});
      $scope.countries = countries.query();
  });
