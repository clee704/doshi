/* global range */
'use strict';

angular.module('timetableJsApp')
  .service('dataStore', function () {
    this.numDays = 5;
    this.numPeriods = 7;
    this.dayIndices = range(this.numDays);
    this.periodIndices = range(this.numPeriods);

    this.example = {
      courses: ['국어', '수학', '직업', '체육'],
      classes: ['1-3', '1-4', '2-2', '2-7', '3-6', '3-7'],
      inputTimetable: [
        [
          [['1-3'], ['국어', '수학']],
          [['1-3', '2-7', '3-6', '3-7']],
          [['2-7', '3-6']],
          [['3-7']],
          [],
          [],
          []
        ],
        [
          [['3-6']],
          [],
          [],
          [['1-3', '2-7']],
          [['2-2']],
          [['2-2', '3-7']],
          []
        ],
        [
          [],
          [],
          [],
          [],
          [['1-4', '3-7']],
          [['1-4', '2-7']],
          []
        ],
        [
          [['1-4', '2-2', '3-6', '3-7']],
          [['2-2', '2-7', '3-6']],
          [],
          [],
          [['1-4']],
          [['2-7']],
          [['1-3', '2-7', '3-7']]
        ],
        [
          [['2-2', '3-7']],
          [['1-3', '1-4']],
          [['1-3', '2-2', '2-7', '3-6']],
          [['1-4']],
          [['1-3', '2-7']],
          [['1-3', '2-7', '3-7']],
          []
        ]
      ],
      maxClasses: {value: 3},
      courseHours: {value: 10},
      courseHoursByCourse: {}
    };

    this.data = {
      version: 10,
      courses: [],
      classes: [],
      inputTimetable: [],
      maxClasses: {},
      courseHours: {},
      courseHoursByCourse: {},
      timetable: [],
      inputChanged: {value: false}
    };

    this.loadExample = function () {
      angular.copy(this.example.courses, this.data.courses);
      angular.copy(this.example.classes, this.data.classes);
      angular.copy(this.example.inputTimetable, this.data.inputTimetable);
      angular.copy(this.example.maxClasses, this.data.maxClasses);
      angular.copy(this.example.courseHours, this.data.courseHours);
      angular.copy(this.example.courseHoursByCourse, this.data.courseHoursByCourse);
    };

    this.onDataChange = function (value, oldValue) {
      if (value === oldValue) return;
      if (this.data.timetable.length) {
        this.data.inputChanged.value = true;
      }
      this.save();
    }.bind(this);

    this.save = function () {
      localStorage.setItem('data', angular.toJson(this.data));
    };

    this.load = function () {
      var json = localStorage.getItem('data');
      if (json !== null) {
        var savedData;
        try {
          savedData = angular.fromJson(json);
        } catch (exc) {
          return;
        }
        if (savedData.version !== this.data.version) {
          localStorage.removeItem('data');
          return;
        }
        angular.copy(savedData.courses, this.data.courses);
        angular.copy(savedData.classes, this.data.classes);
        angular.copy(savedData.inputTimetable, this.data.inputTimetable);
        angular.copy(savedData.maxClasses, this.data.maxClasses);
        angular.copy(savedData.courseHours, this.data.courseHours);
        angular.copy(savedData.courseHoursByCourse, this.data.courseHoursByCourse);
        angular.copy(savedData.timetable, this.data.timetable);
        angular.copy(savedData.inputChanged, this.data.inputChanged);
      }
    };

    this.addCourse = function (course) {
      if (!course) return;
      if (this.data.courses.indexOf(course) === -1) {
        this.data.courses.push(course);
      }
    };

    this.removeCourse = function (course) {
      var i = this.data.courses.indexOf(course);
      if (i !== -1) {
        this.data.courses.splice(i, 1);
        // Remove data containing the removed course from inputTimetable
        var isNotRemovedCourse = function (x) { return course !== x; };
        for (var c = 0; c < this.numDays; c++) {
          for (var r = 0; r < this.numPeriods; r++) {
            var timeInfo = this.data.inputTimetable[c][r];
            if (!timeInfo) continue;
            var courses = timeInfo[1];
            if (!courses) continue;
            angular.copy(courses.filter(isNotRemovedCourse), courses);
          }
        }
      }
    };

    this.addClass = function (klass) {
      if (!klass) return;
      if (this.data.classes.indexOf(klass) === -1) {
        this.data.classes.push(klass);
      }
    };

    this.removeClass = function (klass) {
      var i = this.data.classes.indexOf(klass);
      if (i !== -1) {
        this.data.classes.splice(i, 1);
        // Remove data containing the removed class from inputTimetable
        var isNotRemovedClass = function (x) { return klass !== x; };
        for (var c = 0; c < this.numDays; c++) {
          for (var r = 0; r < this.numPeriods; r++) {
            var timeInfo = this.data.inputTimetable[c][r];
            if (!timeInfo) continue;
            var classes = timeInfo[0];
            if (!classes) continue;
            angular.copy(classes.filter(isNotRemovedClass), classes);
            var courses = timeInfo[1];
            if (classes.length === 0 && courses) {
              courses.length = 0;
            }
          }
        }
      }
    };

    this.load();
  });
