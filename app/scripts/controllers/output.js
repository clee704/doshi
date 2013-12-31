'use strict';

angular.module('doshi')
  .controller('OutputCtrl', function ($scope, appService, screenclick) {
    $scope.page = $scope.getCurrentPage();
    $scope.days = appService.days;
    $scope.periods = appService.periods;
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

    $scope.highlightCourse = function (course) {
      $scope.highlightedCourse = course;
      $scope.highlightedClass = undefined;
      appService.forEachAssignment(function (assignment) {
        assignment.isHighlighted = assignment[0] === course;
      });
    };

    $scope.highlightClass = function (klass) {
      $scope.highlightedCourse = undefined;
      $scope.highlightedClass = klass;
      appService.forEachAssignment(function (assignment) {
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
      appService.forEachAssignment(function (assignment) {
        assignment.isHighlighted = false;
      });
    }

    screenclick(function () { $scope.$apply(dehighlight); });
    dehighlight();
  });
