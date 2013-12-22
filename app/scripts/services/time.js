'use strict';

angular.module('doshi')

  .factory('time', function () {
    return function () {
      return Date.now();
    };
  });
