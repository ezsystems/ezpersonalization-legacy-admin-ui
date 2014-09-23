/**
 * @ngdoc function
 * @name ycBookingApp.controller:BillingCtrl
 * @description
 * # BillingCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
    .controller('BillingCtrl', function ($scope, $resource) {
        'use strict';
        var countries = $resource('assets/countries.json', {}, {});
        $scope.countries = countries.query();
    });