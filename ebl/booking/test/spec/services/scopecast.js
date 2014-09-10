'use strict';

describe('Service: scopecast', function () {

  // load the service's module
  beforeEach(module('ycBookingApp'));

  // instantiate service
  var scopecast;
  beforeEach(inject(function (_scopecast_) {
    scopecast = _scopecast_;
  }));

  it('should do something', function () {
    expect(!!scopecast).toBe(true);
  });

});
