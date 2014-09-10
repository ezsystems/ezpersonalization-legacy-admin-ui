'use strict';

/**
 * @ngdoc function
 * @name ycBookingApp.controller:BookingCtrl
 * @description
 * # BookingCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
  .controller('BookingCtrl', function ($scope, $sessionStorage, ycRestfrontend) {
      //var plans = $resource('assets/plans.json',{},{});
      var plans = ycRestfrontend.getPlans($sessionStorage.productcode);
      console.log(plans);
      $scope.plans = plans;
      $scope.booking.product = $scope.plans.values()[0];
  });
