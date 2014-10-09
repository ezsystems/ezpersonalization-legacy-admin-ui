/**
 * @ngdoc function
 * @name ycBookingApp.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
    .controller('AccountCtrl', function ($timeout, $state, $scope, $sessionStorage, loginData, $translate, ycRestfrontend) {
        'use strict';
        $scope.ready = false;

        $scope.timezones = moment.tz.names();
        $scope.account.timezone = jstz.determine().name();

        //  if (loginData === undefined) {
        //      //var p = $location.path() + "?productCode=" + $sessionStorage.productcode;
        //      ycrestfronten.redirectToLogin();
        //  } else {
        loginData.$promise.then(function (result) {
            $timeout(function () {
                if (!$scope.account.email) {
                    $scope.account.email = result.localProfile.email;
                }
                if (!$scope.account.firstname) {
                    $scope.account.firstname = result.localProfile.firstName;
                }
                if (!$scope.account.lastname) {
                    $scope.account.lastname = result.localProfile.lastName;
                }
                if (!$scope.account.lang && result.localProfile.lang !== undefined && result.localProfile.lang !== null) {
                    $scope.account.lang = result.localProfile.lang;
                    $translate.use($scope.account.lang);
                } else if (!$scope.account.lang){
                    $scope.account.lang == $translate.use();
                }
                if (!$scope.account.timezone) {
                    $scope.account.timezone = result.localProfile.timeZone;
                }
                if (!$scope.account.provider) {
                    $scope.account.provider = result.provider;
                }
                if (!$scope.account.foreignId) {
                    $scope.account.foreignId = result.id;
                }
                if ((result.provider === undefined || result.provider === null || !result.provider) && (result.localProfile.email === undefined || result.localProfile.email === null || !result.localProfile.email)) {
                    if (!$scope.account.email) {
                        $scope.account.email = result.id;
                    }

                }
                if (!$scope.passwordNeeded) {
                    $scope.passwordNeeded = result.passwordNeeded;
                }
                $scope.ready = true;

            });
        });
        $scope.updateProfile = function () {
            var params = {
                provider: $scope.account.provider,
                user_id: $scope.account.foreignId,
                firstName: $scope.account.firstname,
                lastName: $scope.account.lastname,
                timeZone: $scope.account.timezone,
                lang: $scope.account.lang,
                email: $scope.account.email
            };
            $sessionStorage.account = $scope.account;
            ycRestfrontend.updateProfile(params);
        };




    });