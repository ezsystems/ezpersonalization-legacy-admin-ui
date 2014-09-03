angular.module('yc.booking', [
  'yc.booking.app',
  'ui.router',
])
.run(
[ '$rootScope', '$state', '$stateParams',
function ($rootScope, $state, $stateParams) {
// It's very handy to add references to $state and $stateParams to the $rootScope
// so that you can access them from any scope within your applications.For example,
// <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
// to active whenever 'contacts.list' or one of its decendents is active.
$rootScope.$state = $state;
$rootScope.$stateParams = $stateParams;
}
]
)
.config(
  ['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
      /////////////////////////////
      // Redirects and Otherwise //
      /////////////////////////////
      // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
      $urlRouterProvider
      // The `when` method says if the url is ever the 1st param, then redirect to the 2nd param
      // Here we are just setting up some convenience urls.
      .when('/booking?productCode', '/booking/:productCode')
      .otherwise('/booking');
      //////////////////////////
      // State Configurations //
      //////////////////////////
      // Use $stateProvider to configure your states.
      $stateProvider
      .state("booking", {
        // Use a url of "/" to set a states as the "index".
        url: "/booking/:productCode",
        templateUrl: "product.html"
      })
      .state("account", {
        // Use a url of "/" to set a states as the "index".
        url: "/account",
        templateUrl: "finalizeAccount.html"
      })
      .state("checkout", {
        // Use a url of "/" to set a states as the "index".
        url: "/checkout",
        templateUrl: "payment.html"
      })
      .state("billing", {
        // Use a url of "/" to set a states as the "index".
        url: "/billing",
        templateUrl: "billing.html"
      })
    }
  ]
);