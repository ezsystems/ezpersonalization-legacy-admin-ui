/**
 * @ngdoc directive
 * @name ycBookingApp.directive:autoFocus
 * @description
 * # autoFocus
 */
angular.module('ycBookingApp')
    .directive('autoFocus', function ($timeout) {
        'use strict';
        return {
            restrict: 'AC',
            link: function (_scope, _element) {
                $timeout(function () {
                    _element[0].focus();
                }, 0);
            }
        };
    });