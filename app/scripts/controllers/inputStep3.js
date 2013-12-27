'use strict';

angular.module('doshi')
  .controller('EtcInputCtrl', function ($scope, problemArgs, appService) {
    $scope.page = $scope.getCurrentPage();
    $scope.problemArgs = problemArgs;
    $scope.$watch('problemArgs.maxClasses', appService.onDataChange);
    $scope.$watch('problemArgs.courseHours', appService.onDataChange);
    $scope.$watch('problemArgs.courseHoursByCourse', appService.onDataChange, true);
  });
