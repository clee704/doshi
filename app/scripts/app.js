'use strict';

angular.module('doshi', [
  'ngRoute',
  'ngAnimate'
])
  .config(function ($logProvider) {
    $logProvider.debugEnabled(@@debug);
  });
