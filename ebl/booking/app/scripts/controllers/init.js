'use strict';

/**
 * @ngdoc function
 * @name ycBookingApp.controller:InitCtrl
 * @description
 * # InitCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
  .controller('InitCtrl', function ($state, $stateParams, $sessionStorage, $scope, $window, $location, $translate) {
                  if ($stateParams.productCode !== undefined){
                    $sessionStorage.productcode = $stateParams.productCode;
                  }
                  if ($sessionStorage.productcode === undefined ) {
                               var p =  $location.path();
                               $location.url('/pricing?lang=' + $translate.use());
                               $window.location.reload() 
                    
                  }
                  $location.url('/');
		  $state.go($scope.tabs[0].id, {}, {location: false});
  });
