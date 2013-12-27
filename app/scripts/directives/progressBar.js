'use strict';

angular.module('doshi')
  .directive('progressBar', function () {
    // TODO inspect why it doesn't work in IE
    return {
      scope: {value: '=model'},
      templateUrl: 'templates/progress-bar.html'
    };
  });
