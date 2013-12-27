'use strict';

angular.module('doshi')
  .controller('TimesInputCtrl', function ($scope, problemArgs, appService) {
    $scope.page = $scope.getCurrentPage();
    $scope.dayIndices = appService.dayIndices;
    $scope.periodIndices = appService.periodIndices;
    $scope.inputTimetable = problemArgs.inputTimetable;
    $scope.$watch('inputTimetable', appService.onDataChange, true);
  });
