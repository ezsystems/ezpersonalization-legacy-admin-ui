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
      function transformResponse (data){
                   var result = {};
                   for (var i = 0; i<data.length; i++){
                       var product = data[i];
                       if (product.notAvailable) {
                          continue;
                       }
                       result[product.name] = product.comaId.variant;
                       if ($sessionStorage.productcode === product.id && !$scope.booking.planVariantId){
                           $scope.booking.planVariantId = product.comaId.variant;
                       }
                   }
                   $scope.plans = result;
                   return result;
             }

      plans.$promise.then(transformResponse);
  });
