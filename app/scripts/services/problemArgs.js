/* global range */
'use strict';

angular.module('doshi')
  .service('problemArgs', function (NUM_DAYS, NUM_PERIODS) {
    this.courses = [];
    this.classes = [];
    this.inputTimetable = range(NUM_DAYS).map(function () {
      return range(NUM_PERIODS).map(function () { return []; });
    });
    this.maxClasses = null;
    this.courseHours = null;
    this.courseHoursByCourse = {};
  });
