'use strict';

/**
 * @ngdoc function
 * @name ycBookingApp.controller:InitCtrl
 * @description
 * # InitCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
  .controller('InitCtrl', function ($state, $sessionStorage, $scope) {
		  $sessionStorage.productcode = $state.params.productCode;
		  $state.go($scope.tabs[0].id);
  });
