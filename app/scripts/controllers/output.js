/* global Problem, hill_climbing */
'use strict';

angular.module('doshi')
  .controller('OutputCtrl', function ($scope, $timeout, dataStore, maximizeHeight, unmaximizeHeight) {
    $scope.page = $scope.getCurrentPage();

    $scope.timetable = dataStore.data.timetable;
    $scope.inputChanged = dataStore.data.inputChanged;
    $scope.dayIndices = dataStore.dayIndices;
    $scope.periodIndices = dataStore.periodIndices;

    $scope.start = function () {
      var courses = dataStore.data.courses;
      var classes = dataStore.data.classes;
      var inputTimetable = dataStore.data.inputTimetable;
      var maxClasses = dataStore.data.maxClasses.value;
      var courseHours = dataStore.data.courseHours.value;
      var problem;
      try {
        problem = new Problem(courses, classes, inputTimetable, maxClasses, courseHours);
      } catch (exception) {
        alert(exception.message);
        return;
      }
      var fitness = hill_climbing(problem);
      console.log(fitness);
      unmaximizeHeight();
      angular.copy(problem.get_timetable(), $scope.timetable);
      dataStore.save();
      $scope.inputChanged.value = false;
      growInnerTables();
    };

    function growInnerTables() {
      var hasManyRows = function (element) { return element.find('tr').length > 1; };
      $timeout(function () { maximizeHeight(true, hasManyRows); });
    }
    growInnerTables();
  });
