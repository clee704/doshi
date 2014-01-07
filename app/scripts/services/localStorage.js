'use strict';

angular.module('doshi')

  // Wrapper for DOM localStorage. It provides all functions defined on DOM
  // localStorage, plus two more functions for storing and retrieving JavaScript
  // objects in JSON format.
  .service('localStorage', function ($window) {
    var backend = $window.localStorage;

    this.getLength = function () {
      return backend.length;
    };

    this.key = function (index) {
      return backend.key(index);
    };

    this.getItem = function (key) {
      return backend.getItem(key);
    };

    this.setItem = function (key, string) {
      return backend.setItem(key, string);
    };

    this.removeItem = function (key) {
      return backend.removeItem(key);
    };

    this.clear = function () {
      return backend.clear();
    };

    this.dump = function (key, obj) {
      return backend.setItem(key, angular.toJson(obj));
    };

    this.load = function (key) {
      var jsonString = backend.getItem(key);
      if (jsonString !== null) {
        try {
          return angular.fromJson(jsonString);
        } catch (exc) {
          // invalid json string; return null
        }
      }
      return null;
    };
  });
