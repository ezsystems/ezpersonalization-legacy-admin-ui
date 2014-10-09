'use strict';

/**
 * @ngdoc directive
 * @name ycBookingApp.directive:error
 * @description
 * # error
 */
angular.module('ycBookingApp')
    .directive('error', function () {
        return {
            template: '<div class="col-sm-12" ng-repeat="error in cause"><div class="alert alert-danger" translate="{{error}}"></div></div>',
            restrict: 'E',
            scope: {
                cause: '='
            },

            controller: function ($scope, $stateParams) {
                
                if (!$scope.cause instanceof Array) {
                    $scope.cause = [$scope.cause];
                }
                for (var i = 0; i < $scope.cause.length; i++){
                    if ($scope.cause[i] == "") {
                        $scope.cause[i] = "UnmappedError";
                    }
                }
            }
        };
    });