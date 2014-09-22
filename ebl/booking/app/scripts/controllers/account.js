'use strict';

/**
 * @ngdoc function
 * @name ycBookingApp.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
  .controller('AccountCtrl', function ($timeout, $state, $scope, $sessionStorage, loginData) {
                   $scope.ready = false;

                         //  if (loginData === undefined) {
                         //      //var p = $location.path() + "?productCode=" + $sessionStorage.productcode;
                         //      ycrestfronten.redirectToLogin();
                         //  } else {
                           loginData.$promise.then(function(result) {
                              $timeout(function(){
                                  if (!$scope.account.email){
                                      $scope.account.email = result.loginInfo.email;
                                  }
                                  if (!$scope.account.firstname){
                                      $scope.account.firstname = result.loginInfo.firstName;
                                  }
                                  if (!$scope.account.lastname){
                                      $scope.account.lastname = result.loginInfo.lastName;
                                  }
                                  if (!$scope.account.provider){
                                      $scope.account.provider = result.loginInfo.provider;
                                  }
                                  if (!$scope.account.foreignId){
                                      $scope.account.foreignId = result.loginInfo.id;
                                  }
                                  if ((result.loginInfo.provider === undefined || result.loginInfo.provider === null || !result.loginInfo.provider) 
                                       && (result.loginInfo.email === undefined || result.loginInfo.email === null || !result.loginInfo.email)
                                     ){
                                        if (!$scope.account.email){
                                            $scope.account.email = result.loginInfo.id;
                                        }

                                  }
                                  if (!$scope.passwordNeeded){
                                      $scope.passwordNeeded = result.loginInfo.passwordNeeded;
                                  }
                                  $scope.ready = true;

                              });
                             });

                                   

  });
