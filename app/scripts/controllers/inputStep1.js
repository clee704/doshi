'use strict';

angular.module('doshi')
  .controller('CoursesAndClassesInputCtrl', function ($scope, problemArgs, appService) {
    $scope.page = $scope.getCurrentPage();
    $scope.courses = problemArgs.courses;
    $scope.classes = problemArgs.classes;
    $scope._problemArgs = problemArgs;

    $scope.loadExample = function () {
      appService.loadExample();
    };

    $scope.addCourse = function () {
      appService.addCourse($scope.newCourse);
      $scope.newCourse = '';
    };

    $scope.removeCourse = function (course) {
      appService.removeCourse(course);
    };

    $scope.addClass = function () {
      appService.addClass($scope.newClass);
      $scope.newClass = '';
    };

    $scope.removeClass = function (klass) {
      appService.removeClass(klass);
    };

    $scope.$watch('courses', appService.onDataChange, true);
    $scope.$watch('classes', appService.onDataChange, true);
    $scope.$watch('_problemArgs.inputTimetable', appService.onDataChange, true);
    $scope.$watch('_problemArgs.maxClasses', appService.onDataChange);
    $scope.$watch('_problemArgs.courseHours', appService.onDataChange);
    $scope.$watch('_problemArgs.courseHoursByCourse', appService.onDataChange, true);
  })

  .animation('.list-group-item', ['getCssRule', function (getCssRule) {
    // Animate height from the current value to 0.
    // Note that it breaks after LiveReload reloads CSS files. Save this file
    // so that LiveReload reloads the entire page to make it work again.
    var selector = '.input-courses-and-classes .list-group-item:not(.empty).ng-leave';
    var cssRule = getCssRule(selector);
    return {
      leave: function (element, done) {
        if (element.is(':not(.empty)')) {
          if (cssRule) {
            cssRule.style.height = element.height() + 'px';
          }
        }
        done();
      }
    };
  }]);
