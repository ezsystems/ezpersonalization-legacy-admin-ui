/**
 * @ngdoc function
 * @name ycBookingApp.controller:BillingCtrl
 * @description
 * # BillingCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
    .controller('BillingCtrl', function ($scope, tab) {
        'use strict';
        $scope.countries = tab.countries;
    });