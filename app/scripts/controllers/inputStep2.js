'use strict';

angular.module('doshi')
  .controller('TimesInputCtrl', function ($scope, dataStore) {
    $scope.page = $scope.getCurrentPage();

    $scope.inputTimetable = dataStore.data.inputTimetable;
    $scope.dayIndices = dataStore.dayIndices;
    $scope.periodIndices = dataStore.periodIndices;

    $scope.$watch('inputTimetable', dataStore.onDataChange, true);
  });
