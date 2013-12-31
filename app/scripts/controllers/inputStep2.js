'use strict';

angular.module('doshi')
  .controller('TimesInputCtrl', function ($scope, problemArgs, appService, screenclick) {
    $scope.page = $scope.getCurrentPage();
    $scope.days = appService.days;
    $scope.periods = appService.periods;
    $scope.inputTimetable = problemArgs.inputTimetable;
    $scope.courses = problemArgs.courses;
    $scope.classes = problemArgs.classes;
    $scope.selectedCell = null;

    $scope.select = function (cell) {
      unselect();
      cell.isSelected = true;
      $scope.selectedCell = cell;
    };

    function unselect() {
      if ($scope.selectedCell === null) return;
      $scope.selectedCell.isSelected = false;
      $scope.selectedCell = null;
    }

    $scope.toggleClass = function (cell, klass) {
      // Add or remove klass from classes
      var classes = cell[0];
      if (classes) {
        var index = classes.indexOf(klass);
        if (index === -1) {
          // Select new class
          classes.push(klass);
        } else {
          // Unselect existing class
          classes.splice(index, 1);
          var courses = cell[1];
          if (classes.length === 0 && courses) {
            // If there are no classes, remove all courses.
            courses.length = 0;
          }
        }
      } else {
        // Select new class
        classes = cell[0] = [klass];
      }
      classes.sort();
    };

    $scope.toggleCourse = function (cell, course) {
      // Add or remove course from courses
      var courses = cell[1];
      if (courses) {
        var index = courses.indexOf(course);
        if (index === -1) {
          // Select new course
          courses.push(course);
        } else {
          // Unselect existing course
          courses.splice(index, 1);
        }
      } else {
        // Select new class
        courses = cell[1] = [course];
      }
      courses.sort();
    };

    $scope.resetInputTimetable = function () {
      appService.forEachInputCell(function (cell) {
        cell.length = 0;
      });
    };

    screenclick(function () { $scope.$apply(unselect); });

    $scope.$watch('inputTimetable', appService.onDataChange, true);
  });
