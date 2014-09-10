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
                   $scope.ready = false;

                   function redirect(){
                               var p =  $location.path();
                               $location.path('/login.html').search({'return_url': p}).replace();
                               $window.location.reload();
                   }
                           if (loginData === undefined) {
                               //var p = $location.path() + "?productCode=" + $sessionStorage.productcode;
                               redirect();
                           } else {
                           loginData.$promise.then(function(result) {
                              $timeout(function(){
                                  $scope.account.email = result.loginInfo.email;
                                  $scope.account.firstname = result.loginInfo.firstName;
                                  $scope.account.lastname = result.loginInfo.lastName;
                                  $scope.account.provider = result.loginInfo.provider;
                                  $scope.account.foreignId = result.loginInfo.id;
                                  if ((result.loginInfo.provider === undefined || result.loginInfo.provider == null || !result.loginInfo.provider) 
                                       && (result.loginInfo.email === undefined || result.loginInfo.email == null || !result.loginInfo.email)
                                     ){
                                        $scope.account.email = result.loginInfo.id;

                                  }
                                  $scope.passwordNeeded = result.loginInfo.passwordNeeded;
                                  $scope.ready = true;

                              });
                             }, redirect).then(function(){console.log($scope.account)});

                                   
			}

  });
