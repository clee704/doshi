'use strict';

angular.module('doshi')
  .service('problemArgs', function () {
    this.courses = [];
    this.classes = [];
    this.inputTimetable = [];
    this.maxClasses = null;
    this.courseHours = null;
    this.courseHoursByCourse = {};
  });
