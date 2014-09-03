angular
  .module('yc.booking.app', [
    'yc.booking.services',
    'ui.bootstrap',
    'ui.bootstrap.showErrors',
    'ngResource',
    'angularPayments',
    ])


  .controller('bookingCtrl', ['$scope', '$resource', 'scopeService',
    function($scope, $resource, scopeService) {
      var self = this;
      
      var countries = $resource('countries.json',{},{});
      $scope.countries = countries.query();
      
      var plans = $resource('plans.json',{},{});
      $scope.plans = plans.get();

      //$scope.isSuccess = false;

      var paymentConfig = {
        // REQUIRED. The initial order to be displayed. This will be requested immediately upon load
        publicApiKey: "53f1f9371d8dd00714634bf0",
        // REQUIRED. After payment user will be redirected to this URL.
        providerReturnUrl: "https://admin.yoochoose.com",
      };
      self.iteroJSPayment = new IteroJS.Payment(paymentConfig, function() {
        $scope.$apply(function() {
          // When IteroJS is ready, copy the payment methods and initial order
          $scope.payment.ready = true;
          $scope.payment.methods = self.iteroJSPayment.getAvailablePaymentMethods();
          $scope.payment.methodEnum = self.iteroJSPayment.getAvailablePaymentMethodEnum();
          $scope.payment.data.bearer = $scope.payment.methodEnum[0];
        });
      }, function(errorData) {
        alert("error initializing payment!");
        console.log(errorData);
      });


      $scope.product = {
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
      
      checkValid = function(index){
        tab = $scope.tabs[index];
        var valid = $scope[tab.id].form.$valid;
        if(!valid){
          scopeService.broadcast(tab.id,'show-errors-check-validity');
        }
        return valid;
      };
      
      $scope.isEnabled = function(index){
        if (index === 0){
          return true;
        }
        for (var i = 0; (i < $scope.tabs.length && i < index) ; i++) {
          var tab = $scope.tabs[i];
          var form = $scope[tab.id].form;
          if(form === undefined || form.$pristine ||(form.$dirty && !form.$valid)){
            return false;
          }
        }
        return true;

      };
      
      tabDone = function(index, proceed){
        var tab = $scope.tabs[index];
        var valid = checkValid(index);
        if (valid){
          
          if (tab.cleanup !== undefined){
              done = tab.cleanup();
            }
          if (proceed){
            var done = true;
            if (tab.done !== undefined){
              done = tab.done();
            }
            if (done){
              var nextIndex = index +1;
              if (nextIndex < $scope.tabs.length){
                $scope.tabs[nextIndex].active=true;
              }
            }
          }
        }
      };
      
      paymentDone = function() {

        $scope.signupRunning = true;
        // pass the order, customerData and payment data to IteroJS
        // DTO: PaymentData
        cart = {
          planVariantId: $scope.product.selected,
          customFields: {
            website: $scope.product.website
          }
        };
        customerData = {
          emailAddress: $scope.billing.email,
          firstName: $scope.billing.firstname,
          lastName: $scope.billing.lastname,
          tag: $scope.account.tag,
          companyName: $scope.billing.company,
          vatId: $scope.billing.vatid,
          DefaultBearerMedium: 'Email',
          customFields: {
            phone: $scope.billing.phone,
          },
          address: {
            "addressLine1": $scope.billing.company,
            "addressLine2": $scope.billing.addressline2,
            "street": $scope.billing.street,
            "houseNumber": $scope.billing.number,
            "postalCode": $scope.billing.postalcode,
            "city": $scope.billing.city,
            "country": $scope.billing.country
          },
        };
        if ($scope.payment.validto !== undefined) {
          $scope.payment.data.expiryMonth = $scope.payment.validto.getMonth();
          $scope.payment.data.expiryYear = $scope.payment.validto.getFullYear();
        }

        new IteroJS.Signup().subscribe(self.iteroJSPayment, cart, customerData, $scope.payment.data, function(data) {
          // This callback will be invoked when the signup succeeded (or failed)
          // Note that the callback must use $apply, otherwise angularjs won't notice we changed something:
          $scope.$apply(function() {
            $scope.signupdata = data;
            $scope.payment.signupRunning = false;
            if (!data.Url) {
              $scope.isSuccess = true; //done
            } else {
              window.location = data.Url; // redirect required, e.g. paypal, skrill
            }
          });
        }, function(error) {
          alert("an error occurred during signup!");
          console.log(error);
        });
      };
      
      $scope.done = function(index){
        tabDone(index, true);
      };
      
      $scope.deselect = function(index){
        tabDone(index, false);
      };

      $scope.tabs = [ {
        id: 'account',
        title: 'Finalize Account',
        icon: "user",
        template: 'finalizeAccount.html',
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
        id: 'product',
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
        id: 'payment',
        title: 'Payment',
        icon: "credit-card",
        template: 'payment.html',
        done: paymentDone,
      }, ];



    }
  ])

  .directive('match', function() {
    return {
      require: 'ngModel',
      restrict: 'A',
      scope: {
        match: '='
      },
      link: function(scope, elem, attrs, ctrl) {
        scope.$watch(function() {
          modelValue = ctrl.$modelValue || ctrl.$$invalidModelValue;
          return (ctrl.$pristine && angular.isUndefined(modelValue)) || scope.match === modelValue;
        }, function(currentValue) {
          ctrl.$setValidity('match', currentValue);
        });
      }
    };
  })

.directive('ycIsolate', ['scopeService',
  function(scopeService) {
    return {
      restrict: 'E',
      scope: {
        id: '&id'
      },
      link: function (scope, element, attrs) {
        scopeService.publishScope(scope.id(),scope);
      }
    };
  }
])



;