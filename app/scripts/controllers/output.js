'use strict';

angular.module('doshi')
  .controller('OutputCtrl', function ($scope, appData, appService, screenclick) {
    $scope.page = $scope.getCurrentPage();
    $scope.dayIndices = appService.dayIndices;
    $scope.periodIndices = appService.periodIndices;
    $scope.appData = appData;
    $scope.status = appService.status;

    $scope.isHighlighted = [];
    $scope.highlightedCourse = undefined;
    $scope.highlightedClass = undefined;

    $scope.start = function () {
      appService.start();
    };

    $scope.pause = function () {
      appService.pause();
    };

    $scope.resume = function () {
      appService.resume();
    };

    $scope.highlightCourse = function (course) {
      $scope.highlightedCourse = course;
      $scope.highlightedClass = undefined;
      for (var i = 0; i < appService.numDays; i++) {
        for (var j = 0; j < appService.numPeriods; j++) {
          $scope.isHighlighted[i][j] = [];
          var assignments = appData.timetable[i][j];
          if (!assignments) continue;
          for (var k = 0; k < assignments.length; k++) {
            if (assignments[k][0] === course) {
              $scope.isHighlighted[i][j][k] = true;
              break;
            }
          }
        }
      }
    };

    $scope.highlightClass = function (klass) {
      $scope.highlightedCourse = undefined;
      $scope.highlightedClass = klass;
      for (var i = 0; i < appService.numDays; i++) {
        for (var j = 0; j < appService.numPeriods; j++) {
          $scope.isHighlighted[i][j] = [];
          var assignments = appData.timetable[i][j];
          if (!assignments) continue;
          for (var k = 0; k < assignments.length; k++) {
            var classes = assignments[k][1];
            for (var l = 0; l < classes.length; l++) {
              if (classes[l] === klass) {
                $scope.isHighlighted[i][j][k] = true;
                break;
              }
            }
            if ($scope.isHighlighted[i][j][k]) break;
          }
        }
      }
    };

    function dehighlight() {
      $scope.highlightedCourse = undefined;
      $scope.highlightedClass = undefined;
      for (var i = 0; i < appService.numDays; i++) {
        $scope.isHighlighted[i] = [];
        for (var j = 0; j < appService.numPeriods; j++) {
          $scope.isHighlighted[i][j] = [];
        }
      }
    }

    screenclick(function () { $scope.$apply(dehighlight); });
    dehighlight();
  });
