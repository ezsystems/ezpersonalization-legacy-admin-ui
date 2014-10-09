/**
 * @ngdoc function
 * @name ycBookingApp.controller:BillingCtrl
 * @description
 * # BillingCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
    .controller('BillingCtrl', function ($scope, tab, $sessionStorage) {
        'use strict';
        $scope.countries = tab.countries;
    
        $scope.storeSession = function () {
            $sessionStorage.billing = $scope.billing;
        }
    });