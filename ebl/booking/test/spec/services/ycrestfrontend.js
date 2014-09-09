'use strict';

describe('Service: ycRestfrontend', function () {

  // load the service's module
  beforeEach(module('ycBookingApp'));

  // instantiate service
  var ycRestfrontend;
  beforeEach(inject(function (_ycRestfrontend_) {
    ycRestfrontend = _ycRestfrontend_;
  }));

  it('should do something', function () {
    expect(!!ycRestfrontend).toBe(true);
  });

});
