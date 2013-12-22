'use strict';

angular.module('timetableJsApp')
  .controller('EtcInputCtrl', function ($scope, dataStore) {
    $scope.page = $scope.getCurrentPage();

    $scope.maxClasses = dataStore.data.maxClasses;
    $scope.courseHours = dataStore.data.courseHours;
    $scope.courseHoursByCourse = dataStore.data.courseHoursByCourse;

    $scope.$watch('maxClasses.value', dataStore.onDataChange);
    $scope.$watch('courseHours.value', dataStore.onDataChange);
    $scope.$watch('courseHoursByCourse', dataStore.onDataChange, true);
  });
