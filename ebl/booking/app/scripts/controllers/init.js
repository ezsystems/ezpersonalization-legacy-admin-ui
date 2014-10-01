/**
 * @ngdoc function
 * @name ycBookingApp.controller:InitCtrl
 * @description
 * # InitCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
    .controller('InitCtrl', function ($state, $stateParams, $sessionStorage, $scope, $window, $location, $translate) {
        'use strict';
        if ($stateParams.directId !== undefined) {
            $sessionStorage.directId = $stateParams.directId;
        }
        if ($stateParams.productCode !== undefined) {
            $sessionStorage.productcode = $stateParams.productCode;
        }
        if ($sessionStorage.productcode === undefined) {
            $location.url('/pricing?lang=' + $translate.use());
            $window.location.href = $location.url();

        }
        $location.url('/');
        $state.go($scope.tabs[0].id, {}, {
            location: false
        });
    });