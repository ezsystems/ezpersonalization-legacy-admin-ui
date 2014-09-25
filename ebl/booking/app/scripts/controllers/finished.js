'use strict';

/**
 * @ngdoc function
 * @name ycBookingApp.controller:FinishedCtrl
 * @description
 * # FinishedCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
  .controller('FinishedCtrl', function ($scope, $stateParams, $timeout) {

     $scope.contractid = $stateParams.contractid;
     $scope.customerid = $stateParams.customerid;
     $scope.orderid = $stateParams.orderid;

     $scope.setupFinished = false;

     $timeout(function(){
        $scope.setupFinished = true;
        $scope.mandatorid = 'FRESH_NEW_1111';
     }, 3000);

  });
