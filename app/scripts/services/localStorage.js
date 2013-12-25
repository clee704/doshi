'use strict';

angular.module('doshi')

  // Wrapper for DOM localStorage. It provides all functions defined on DOM
  // localStorage, plus two more functions for storing and retrieving JavaScript
  // objects in JSON format.
  .service('localStorage', function ($window) {
    var storage = $window.localStorage;

    this.getLength = function () {
      return storage.length;
    };

    this.key = function (index) {
      return storage.key(index);
    };

    this.getItem = function (key) {
      return storage.getItem(key);
    };

    this.setItem = function (key, string) {
      return storage.setItem(key, string);
    };

    this.removeItem = function (key) {
      return storage.removeItem(key);
    };

    this.clear = function () {
      return storage.clear();
    };

    this.dump = function (key, obj) {
      return storage.setItem(key, angular.toJson(obj));
    };

    this.load = function (key) {
      var jsonString = storage.getItem(key);
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
