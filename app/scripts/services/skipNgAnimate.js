'use strict';

angular.module('doshi')

  // Disable animation for child elements.
  // Workaround until 1.2.7 is out with the feature:
  // https://github.com/angular/angular.js/commit/cef084ade9072090259d8c679751cac3ffeaed51.
  // TODO change when 1.2.7 is out
  .directive('skipNgAnimate', function ($animate) {
    return {
      compile: function (element) {
        $animate.enabled(false, element);
      }
    };
  });
