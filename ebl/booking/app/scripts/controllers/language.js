'use strict';

/**
 * @ngdoc function
 * @name ycBookingApp.controller:LanguageCtrl
 * @description
 * # LanguageCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
  .controller('LanguageCtrl', function ($scope, $translate) {
      $scope.languages = ['en', 'de'];
      $scope.changeLanguage = function (langKey) {
          console.log("switch language to ", langKey);
          $translate.use(langKey);
        };
      
    });
