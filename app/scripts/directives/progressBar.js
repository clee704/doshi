'use strict';

angular.module('doshi')
  .directive('progressBar', function () {
    return {
      scope: {value: '=model'},
      templateUrl: 'templates/progress-bar.html'
    };
  });
