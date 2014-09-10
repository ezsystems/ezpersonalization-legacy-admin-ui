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

   $rootScope.$on('$stateChangeStart', 
    function(event, toState, toParams, fromState, fromParams){
        if (!isEnabled(toState.name)){ 
                $scope.$broadcast('show-errors-check-validity');
	        event.preventDefault(); 
		}
    });


      $scope.tabs = tab.tabs;

      $scope.booking = {
      };
      $scope.account = {
        email: 'yc-pactas@byom.de',
      };
      $scope.billing = {
      };
      $scope.payment = {
        opendatepicker: false,
        
        ready: false,
        methods: {},
        methodEnum: [],
        data: {
          bearer: ''
        },
        pickdate: function($event) {
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

      function getTabIndexById(id){
        for (var i = 0; (i < $scope.tabs.length ) ; i++) {
          var tab = $scope.tabs[i];
	  if (tab.id == id) {
		  return i;
	  }
	}
	return -1;
      }
      
      
      function isEnabled(id){
	var max = getTabIndexById(id)
        for (var i = 0; (i < $scope.tabs.length && i < max ) ; i++) {
          var tab = $scope.tabs[i];
	  if (tab.id == id) {
		  break;
	  }
          var form = $scope[tab.id].form;
          if(form === undefined || !form.$valid){
            return false;
          }
        }
        return true;

      };

      function go(id){$state.go(id,{},{location:false})};
      $scope.go = go;



      
      

  });
