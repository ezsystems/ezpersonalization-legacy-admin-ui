'use strict';

/**
 * @ngdoc function
 * @name ycBookingApp.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
  .controller('AccountCtrl', function ($state, $scope, $location, $window, $sessionStorage, loginData) {
                           console.log(loginData);
                           if (loginData === undefined) {
                               //var p = $location.path() + "?productCode=" + $sessionStorage.productcode;
                               var p = $state.current.url;
                               console.log('not logged in', p);
                               $location.path('/login.html').search({'return_url': p}).replace();
                               $window.location.reload() 
                           }

  });
