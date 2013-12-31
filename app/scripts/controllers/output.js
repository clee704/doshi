'use strict';

angular.module('doshi')
  .controller('OutputCtrl', function ($scope, problemArgs, appService, screenclick) {
    $scope.page = $scope.getCurrentPage();
    $scope.dayIndices = appService.dayIndices;
    $scope.periodIndices = appService.periodIndices;
    $scope.status = appService.status;
    $scope.timetable = appService.timetable;
    $scope.timetableStats = appService.timetableStats;
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

    function forEachAssignment(callback) {
      for (var i = 0; i < appService.numDays; i++) {
        for (var j = 0; j < appService.numPeriods; j++) {
          var assignments = appService.timetable[i][j];
          if (!assignments) continue;
          for (var k = 0; k < assignments.length; k++) {
            callback.call(undefined, assignments[k]);
          }
        }
      }
    }

    $scope.highlightCourse = function (course) {
      $scope.highlightedCourse = course;
      $scope.highlightedClass = undefined;
      forEachAssignment(function (assignment) {
        assignment.isHighlighted = assignment[0] === course;
      });
    };

    $scope.highlightClass = function (klass) {
      $scope.highlightedCourse = undefined;
      $scope.highlightedClass = klass;
      forEachAssignment(function (assignment) {
        assignment.isHighlighted = false;
        var classGroup = assignment[1];
        for (var l = 0; l < classGroup.length; l++) {
          if (classGroup[l] === klass) {
            assignment.isHighlighted = true;
            break;
          }
        }
      });
    };

    function dehighlight() {
      $scope.highlightedCourse = undefined;
      $scope.highlightedClass = undefined;
      forEachAssignment(function (assignment) {
        assignment.isHighlighted = false;
      });
    }

    screenclick(function () { $scope.$apply(dehighlight); });
    dehighlight();
  });
