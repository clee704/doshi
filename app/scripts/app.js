'use strict';

angular.module('timetableJsApp', [
  'ngRoute',
  'ngAnimate'
])
  .run(function (maintainMaximizedHeight) {
    maintainMaximizedHeight(true);
  });
