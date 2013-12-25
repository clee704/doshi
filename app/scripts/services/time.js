'use strict';

angular.module('doshi')

  // Returns the number of milliseconds elapsed since 1 Janulary 1970 00:00:00 UTC.
  // This service is a wrapper for Date.now().
  .factory('time', function () {
    return function () {
      return Date.now();
    };
  });
