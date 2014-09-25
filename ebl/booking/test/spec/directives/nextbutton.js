'use strict';

describe('Directive: nextButton', function () {

  // load the directive's module
  beforeEach(module('ycBookingApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<next-button></next-button>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the nextButton directive');
  }));
});
