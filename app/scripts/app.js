'use strict';

angular.module('doshi', [
  'ngRoute',
  'ngAnimate'
])
  .factory('debug', function ($window, $location) {
    var hostname = $location.host();
    return $window._DOSHI_DEBUG ||
        hostname === '0.0.0.0' ||
        hostname === '127.0.0.1' ||
        hostname === 'localhost';
  });
