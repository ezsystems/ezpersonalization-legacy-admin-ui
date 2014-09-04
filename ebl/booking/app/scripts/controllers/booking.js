'use strict';

/**
 * @ngdoc function
 * @name ycBookingApp.controller:BookingCtrl
 * @description
 * # BookingCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
  .controller('BookingCtrl', function ($scope, $resource) {
      var plans = $resource('assets/plans.json',{},{});
      $scope.plans = plans.get();
  });
