'use strict';

angular.module('doshi')

  // Merges consecutive calls occurring faster than the given rate and calls the
  // function only at the end of such series of calls.
  .factory('debounce', function ($timeout, time) {
    return function (fn, rate) {
      var timerId,
          lastFired;
      function run() {
        var args = arguments,
            now = time();
        if (lastFired === undefined || lastFired + rate > now) {
          if (timerId !== undefined) $timeout.cancel(timerId);
          timerId = $timeout(function () { run.apply(null, args); }, rate);
          lastFired = now;
        } else {
          fn.apply(null, args);
          lastFired = undefined;
        }
      }
      return run;
    };
  });
