'use strict';

/**
 * @ngdoc service
 * @name ycBookingApp.tab
 * @description
 * # tab
 * Factory in the ycBookingApp.
 */
angular.module('ycBookingApp')
  .factory('tab', function (scopecast) {

    var tabs = [ {
        id: 'account',
        title: 'Finalize Account',
        icon: "user",
        template: 'account.html',
        cleanup: function(){
          if ($scope.billing.firstname === undefined){
            $scope.billing.firstname = $scope.account.firstname;
          }
          if ($scope.billing.lastname === undefined){
            $scope.billing.lastname = $scope.account.lastname;
          }
          if ($scope.billing.email === undefined){
            $scope.billing.email = $scope.account.email;
          }
        }
      },
      {
        id: 'booking',
        title: 'Configure Product',
        icon: "shopping-cart",
        template: 'product.html',

      },
      {
        id: 'billing',
        title: 'Billing',
        icon: "envelope",
        template: 'billing.html',
      }, {
        id: 'checkout',
        title: 'Checkout',
        icon: "credit-card",
        template: 'checkout.html',
        done: function(){checkout.paymentDone($scope.product, $scope.billing, $scope.payment)},
      }, ];





    // Public API here
    return {
	tabs: tabs,
      }
  });
