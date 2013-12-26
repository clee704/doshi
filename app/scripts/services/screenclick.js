'use strict';

angular.module('doshi')
  .factory('screenclick', function ($window) {
    var listeners = [];
    angular.element($window).on('click', function (event) {
      for (var i = 0; i < listeners.length; i++) {
        listeners[i].call(this, event);
      }
    });
    return function (listener) {
      listeners.push(listener);
    };
  });
