/**
 * @ngdoc function
 * @name ycBookingApp.controller:CheckoutCtrl
 * @description
 * # CheckoutCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
    .controller('CheckoutCtrl', function ($scope, $state, $timeout, $location) {
        'use strict';
        var self = this;


        $scope.opendatepicker = false;

        $scope.ready = false;
        $scope.paymentMethods = {};
        $scope.paymentMethodEnum = [];
        $scope.payment = {
            bearer: ''
        };
        $scope.pickdate = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            this.opendatepicker = !this.opendatepicker;
        };
        $scope.dateOptions = {
            datepickerMode: 'month',
            minMode: 'month',
            maxMode: 'month',
            formatMonth: 'MM'
        };



        $scope.isSuccess = false;

        var paymentConfig = {
            // REQUIRED. The initial order to be displayed. This will be requested immediately upon load
            publicApiKey: '53f1f9371d8dd00714634bf0',
            // REQUIRED. After payment user will be redirected to this URL.
            providerReturnUrl: $state.href('paymentDone', {}, {
                absolute: true
            })
        };
        self.iteroJSPayment = new IteroJS.Payment(paymentConfig, function () {
            $timeout(function () {
                $scope.$apply(function () {
                    // When IteroJS is ready, copy the payment methods and initial order
                    $scope.ready = true;
                    $scope.paymentMethods = self.iteroJSPayment.getAvailablePaymentMethods();
                    $scope.paymentMethodEnum = self.iteroJSPayment.getAvailablePaymentMethodEnum();
                    $scope.payment.bearer = $scope.paymentMethodEnum[0];
                });
            });
        }, function (errorData) {
            alert('error initializing payment!');
            console.log(errorData);
        });

        $scope.isDebit = function () {
            return $scope.payment.bearer === 'Debit:Paymill' || $scope.payment.bearer === 'Debit:FakePSP';
        };

        $scope.isCreditCard = function () {
            return $scope.payment.bearer === 'CreditCard:Paymill' || $scope.payment.bearer === 'CreditCard:FakePSP';
        };


        function checkout(cartData, billingData, paymentData) {
            $scope.errorCode =[];

            var cart = {
                planVariantId: cartData.planVariantId,
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
                    phone: billingData.phone
                },
                address: {
                    'addressLine1': billingData.company,
                    'addressLine2': billingData.addressline2,
                    'street': billingData.street,
                    'houseNumber': billingData.number,
                    'postalCode': billingData.postalcode,
                    'city': billingData.city,
                    'country': billingData.country
                }
            };
            if ($scope.validto !== undefined) {
                paymentData.expiryMonth = $scope.validto.getMonth() + 1;
                paymentData.expiryYear = $scope.validto.getFullYear();
            }

            var signup = new IteroJS.Signup();

            signup.createOrder(cart, customerData, function (order) {
                    // link contract and login here
                    console.log(order);

                    //continue to payment
                    signup.paySignupInteractive(self.iteroJSPayment, paymentData, order, function (data) {
                        // This callback will be invoked when the signup succeeded (or failed)
                        // Note that the callback must use $apply, otherwise angularjs won't notice we changed something:
                        $scope.$apply(function () {
                            if (!data.Url) {
                                $scope.isSuccess = true; //done
                                var params = {
                                    contractid: data.ContractId,
                                    customerid: data.CustomerId,
                                    orderid: data.OrderId
                                };
                                console.log(params);
                                $state.go('finished', params, {
                                    location: false
                                });
                            } else {
                                console.log(data);
                                window.location = data.Url; // redirect required, e.g. paypal, skrill
                            }
                        });
                    }, function (error) {
                        $scope.$apply(function () {
                            $scope.errorCode = error['errorCode'];
                            for (var i in $scope.errorCode) {
                                if ($scope.errorCode[i] === "") {
                                    $scope.errorCode[i] = "UnmappedError";
                                }
                            }
                        })
                    });

                },
                function (error) {
                    $scope.$apply(function () {
                        $scope.errorCode = error['errorCode'];
                        if ($scope.errorCode[i] === "") {
                            $scope.errorCode[i] = "UnmappedError";
                        }
                    })
                });
        }

        $scope.checkout = function () {
            if ($scope.payment.form.$valid) {
                checkout($scope.booking, $scope.billing, $scope.payment);
            }
        };



    });