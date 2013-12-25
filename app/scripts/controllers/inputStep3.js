'use strict';

angular.module('doshi')
  .controller('EtcInputCtrl', function ($scope, appData, appService) {
    $scope.page = $scope.getCurrentPage();
    $scope.appData = appData;
    $scope.$watch('appData.maxClasses', appService.onDataChange);
    $scope.$watch('appData.courseHours', appService.onDataChange);
    $scope.$watch('appData.courseHoursByCourse', appService.onDataChange, true);
  });
