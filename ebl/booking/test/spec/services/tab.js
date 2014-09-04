'use strict';

describe('Service: tab', function () {

  // load the service's module
  beforeEach(module('ycBookingApp'));

  // instantiate service
  var tab;
  beforeEach(inject(function (_tab_) {
    tab = _tab_;
  }));

  it('should do something', function () {
    expect(!!tab).toBe(true);
  });

});
