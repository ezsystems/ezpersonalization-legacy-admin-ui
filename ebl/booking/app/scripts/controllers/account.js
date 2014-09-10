'use strict';

/**
 * @ngdoc function
 * @name ycBookingApp.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
  .controller('AccountCtrl', function ($timeout, $state, $scope, $location, $window, $sessionStorage, loginData) {
                           if (loginData === undefined) {
                               //var p = $location.path() + "?productCode=" + $sessionStorage.productcode;
                               var p =  $location.path();
                               $location.path('/login.html').search({'return_url': p}).replace();
                               $window.location.reload() 
                           } else {
                           loginData.$promise.then(function(result) {
                              $timeout(function(){$scope.$apply(function(){
                                  $scope.account.email = result.loginInfo.email;
                                  $scope.account.firstname = result.loginInfo.firstName;
                                  $scope.account.lastname = result.loginInfo.lastName;
                                  $scope.account.provider = result.loginInfo.provider;
                                  $scope.account.foreignId = result.loginInfo.id;
                                  $scope.passwordNeeded = result.loginInfo.passwordNeeded;
                              });
                             });});
                                   
			}

  });
