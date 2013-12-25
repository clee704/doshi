'use strict';

angular.module('doshi')
  .controller('TimesInputCtrl', function ($scope, appData, appService) {
    $scope.page = $scope.getCurrentPage();
    $scope.dayIndices = appService.dayIndices;
    $scope.periodIndices = appService.periodIndices;
    $scope.appData = appData;
    $scope.$watch('appData.inputTimetable', appService.onDataChange, true);
  });
