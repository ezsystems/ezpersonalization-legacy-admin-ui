'use strict';

/**
 * @ngdoc service
 * @name ycBookingApp.tab
 * @description
 * # tab
 * Factory in the ycBookingApp.
 */
angular.module('ycBookingApp')
    .factory('tab', function () {

        var tabs = [{
                id: 'account',
                icon: 'user',
                template: 'account.html'
      },
            {
                id: 'booking',
                title: 'Configure Product',
                icon: 'shopping-cart'

      },
            {
                id: 'billing',
                title: 'Billing',
                icon: 'envelope'
      }, {
                id: 'checkout',
                title: 'Checkout',
                icon: 'credit-card'
      }, ];

        // Public API here
        return {
            tabs: tabs,
        };
    });