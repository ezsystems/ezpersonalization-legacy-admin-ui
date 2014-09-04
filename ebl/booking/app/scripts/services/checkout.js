'use strict';

/**
 * @ngdoc service
 * @name ycBookingApp.checkout
 * @description
 * # checkout
 * Factory in the ycBookingApp.
 */
angular.module('ycBookingApp')
  .factory('checkout', function ($timeout ) {

      var service = {};

      var paymentConfig = {
        // REQUIRED. The initial order to be displayed. This will be requested immediately upon load
        publicApiKey: "53f1f9371d8dd00714634bf0",
        // REQUIRED. After payment user will be redirected to this URL.
        providerReturnUrl: "https://admin.yoochoose.com",
      };
      
      service.iteroJSPayment = new IteroJS.Payment(paymentConfig, function() {
        $timeout(function() {
          // When IteroJS is ready, copy the payment methods and initial order
          service.ready = true;
          service.methods = service.iteroJSPayment.getAvailablePaymentMethods();
          service.methodEnum = service.iteroJSPayment.getAvailablePaymentMethodEnum();
          //$scope.payment.data.bearer = $scope.payment.methodEnum[0];
        });
      }, function(errorData) {
        alert("error initializing payment!");
        console.log(errorData);
      });


      function checkout(cartData, billingData, paymentData) {

      var cart = {
          planVariantId: cartData.selected,
          customFields: {
            website: cartData.website
          }
        };
        var customerData = {
          emailAddress: billingData.email,
          firstName: billingData.firstname,
          lastName: billingData.lastname,
          tag: billingData.tag,
          companyName: billingData.company,
          vatId: billingData.vatid,
          DefaultBearerMedium: 'Email',
          customFields: {
            phone: billingData.phone,
          },
          address: {
            "addressLine1": billingData.company,
            "addressLine2": billingData.addressline2,
            "street": billingData.street,
            "houseNumber": billingData.number,
            "postalCode": billingData.postalcode,
            "city": billingData.city,
            "country": billingData.country
          },
        };
        if (paymentData.validto !== undefined) {
          paymentData.data.expiryMonth = paymentData.validto.getMonth();
          paymentData.data.expiryYear = paymentData.validto.getFullYear();
        }

        new IteroJS.Signup().subscribe(service.iteroJSPayment, cart, customerData, paymentData, function(data) {
          // This callback will be invoked when the signup succeeded (or failed)
          // Note that the callback must use $apply, otherwise angularjs won't notice we changed something:
          $rootScope.$apply(function() {
            if (!data.Url) {
              service.isSuccess = true; //done
            } else {
              window.location = data.Url; // redirect required, e.g. paypal, skrill
            }
          });
        }, function(error) {
          alert("an error occurred during signup!");
          console.log(error);
        });
      };
      service.checkout = checkout;

    // Public API here
    return service;
  });
