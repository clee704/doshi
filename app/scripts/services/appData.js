'use strict';

angular.module('doshi')
  .service('appData', function () {
    this.version = 0;
    this.courses = [];
    this.classes = [];
    this.inputTimetable = [];
    this.maxClasses = null;
    this.courseHours = null;
    this.courseHoursByCourse = {};
    this.timetable = [];
    this.timetableStats = {
      daysByCourse: {},
      coursesByClass: {}
    };
  });
