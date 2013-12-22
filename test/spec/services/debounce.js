'use strict';


describe('debounce', function () {

  var foo, wrappedFoo, tick;

  beforeEach(module('timetableJsApp'));
  beforeEach(function () {
    var $timeout;
    foo = jasmine.createSpy('foo');
    module(function ($provide) {
      var t = 0;
      var mockTime = function () { return t; };
      tick = function (msec) {
        t += msec;
        $timeout.flush(msec);
      };
      $provide.value('time', mockTime);
    });
    inject(function (_$timeout_, $injector) {
      $timeout = _$timeout_;
      var debounce = $injector.get('debounce');
      wrappedFoo = debounce(foo, 500);
    });
  });

  it('should delay the call', function () {
    wrappedFoo(1);
    expect(foo).not.toHaveBeenCalled();
    tick(499);
    expect(foo).not.toHaveBeenCalled();
    tick(1);
    expect(foo.calls.length).toBe(1);
  });

  it('should call the function only at the end of a series of calls', function () {
    wrappedFoo(1);
    tick(499);
    wrappedFoo(2);
    tick(499);
    wrappedFoo(3);
    tick(499);
    wrappedFoo(4);
    expect(foo.calls.length).toBe(0);
    tick(499);
    expect(foo.calls.length).toBe(0);
    tick(1);
    expect(foo.calls.length).toBe(1);
  });
});
