'use strict';

angular.module('doshi')
  .controller('CoursesAndClassesInputCtrl', function ($scope, dataStore) {
    $scope.page = $scope.getCurrentPage();

    $scope.courses = dataStore.data.courses;
    $scope.classes = dataStore.data.classes;

    $scope.loadExample = function () {
      dataStore.loadExample();
    };

    $scope.addCourse = function () {
      dataStore.addCourse($scope.newCourse);
      $scope.newCourse = '';
    };

    $scope.removeCourse = function (course) {
      dataStore.removeCourse(course);
    };

    $scope.addClass = function () {
      dataStore.addClass($scope.newClass);
      $scope.newClass = '';
    };

    $scope.removeClass = function (klass) {
      dataStore.removeClass(klass);
    };

    $scope.$watch('courses', dataStore.onDataChange, true);
    $scope.$watch('classes', dataStore.onDataChange, true);
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
