'use strict';

describe('Controller: TabCtrl', function () {

  // load the controller's module
  beforeEach(module('ycBookingApp'));

  var TabCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TabCtrl = $controller('TabCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
