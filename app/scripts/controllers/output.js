'use strict';

angular.module('doshi')
  .controller('OutputCtrl', function ($scope, appData, appService) {
    $scope.page = $scope.getCurrentPage();
    $scope.dayIndices = appService.dayIndices;
    $scope.periodIndices = appService.periodIndices;
    $scope.appData = appData;
    $scope.status = appService.status;

    $scope.start = function () {
      appService.start();
    };

    $scope.pause = function () {
      appService.pause();
    };

    $scope.resume = function () {
      appService.resume();
    };
  });
