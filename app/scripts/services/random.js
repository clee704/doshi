'use strict';

angular.module('doshi')
  .service('random', function () {
    var random = this;

    random.uniform = function () {
      return Math.random();
    };

    random.choice = function (choices, probabilities) {
      var r = random.uniform();
      var c = 0;
      for (var i = 0; i < choices.length; i++) {
        c += probabilities[i];
        if (r < c) return choices[i];
      }
    };
  });
