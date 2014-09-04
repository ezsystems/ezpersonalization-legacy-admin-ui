'use strict';

/**
 * @ngdoc directive
 * @name ycBookingApp.directive:match
 * @description
 * # match
 */
angular.module('ycBookingApp')
  .directive('match', function() {
    return {
      require: 'ngModel',
      restrict: 'A',
      scope: {
        match: '='
      },
      link: function(scope, elem, attrs, ctrl) {
        scope.$watch(function() {
          var modelValue = ctrl.$modelValue || ctrl.$$invalidModelValue;
          return (ctrl.$pristine && angular.isUndefined(modelValue)) || scope.match === modelValue;
        }, function(currentValue) {
          ctrl.$setValidity('match', currentValue);
        });
      }
    };
  });

