/**
 * @ngdoc function
 * @name ycBookingApp.controller:BookingCtrl
 * @description
 * # BookingCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
    .controller('BookingCtrl', function ($scope, $sessionStorage, ycRestfrontend, $translate) {
        'use strict';
        //var plans = $resource('assets/plans.json',{},{});
        var plans = ycRestfrontend.getPlans($sessionStorage.productcode);
        $scope.timezones = moment.tz.names();
        $scope.booking.timezone = jstz.determine().name();

        $scope.currencies = ["EUR", "USD", "NOK", "GBP", "CHF"];

        function transformResponse(data) {
            var result = {};
            for (var i = 0; i < data.length; i++) {
                var product = data[i];
                if (product.notAvailable) {
                    continue;
                }
                result[product.name] = product.comaId.variant;
                if ($sessionStorage.productcode === product.id && !$scope.booking.planVariantId) {
                    $scope.booking.planVariantId = product.comaId.variant;
                }
            }
            $scope.plans = result;
            return result;
        }

        plans.$promise.then(transformResponse);

        $scope.storeSession = function () {
            $sessionStorage.booking = $scope.booking;
        }
    });