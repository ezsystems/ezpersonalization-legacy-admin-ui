'use strict';

describe('Controller: FinishedCtrl', function () {

  // load the controller's module
  beforeEach(module('ycBookingApp'));

  var FinishedCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FinishedCtrl = $controller('FinishedCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
