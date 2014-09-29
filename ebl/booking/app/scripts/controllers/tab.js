'use strict';

/**
 * @ngdoc function
 * @name ycBookingApp.controller:TabCtrl
 * @description
 * # TabCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
    .controller('TabCtrl', function ($state, $rootScope, $scope, tab) {

        function getTabIndexById(id) {
            for (var i = 0; (i < $scope.tabs.length); i++) {
                var tab = $scope.tabs[i];
                if (tab.id === id) {
                    return i;
                }
            }
            return -1;
        }

        function isEnabled(id) {
            var max = getTabIndexById(id);
            console.log('isEnabled', id);
            for (var i = 0; (i < $scope.tabs.length && i < max); i++) {
                var tab = $scope.tabs[i];
                if (tab.id === id) {
                    break;
                }
                var form = $scope[tab.id].form;
                var formfields = 0;
                for (var k in form){
                    if (/^[^$].+/.test(k)){
                        formfields++;
                    }
                }

                if (form === undefined || !form.$valid || formfields == 0) {
                    return false;
                }
            }
            return true;

        }

        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                if (!isEnabled(toState.name)) {
                    $scope.$broadcast('show-errors-check-validity');
                    event.preventDefault();
                }
            });


        $scope.tabs = tab.tabs;

        $scope.booking = {};
        $scope.account = {};
        $scope.billing = {};
        $scope.payment = {
            opendatepicker: false,

            ready: false,
            methods: {},
            methodEnum: [],
            data: {
                bearer: ''
            },
            pickdate: function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                this.opendatepicker = !this.opendatepicker;
            },
            dateOptions: {
                minMode: 'month',
                maxMode: 'month',
                formatMonth: 'MM',
            },
            today: new Date(),
        };






        function go(id) {
            $state.go(id, {}, {
                location: false
            });
        }
        $scope.go = go;






    });