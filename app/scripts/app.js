'use strict';

angular.module('doshi', [
  'ngRoute',
  'ngAnimate'
])
  .run(function (maintainMaximizedHeight) {
    maintainMaximizedHeight(true);
  });
