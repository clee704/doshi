'use strict';

angular.module('timetableJsApp')

  .factory('time', function () {
    return function () {
      return Date.now();
    };
  });
