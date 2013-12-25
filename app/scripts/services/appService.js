/* global range, isDeepEmpty */
'use strict';

angular.module('doshi')
  .service('appService', function ($timeout, Solver, appData, localStorage) {
    var appService = this;

    this.numDays = 5;
    this.numPeriods = 7;
    this.dayIndices = range(this.numDays);
    this.periodIndices = range(this.numPeriods);
    this.solver = new Solver();
    this.status = {
      emptyInput: true,
      inputChanged: false,
      showHelp: true,
      running: false,
      paused: false,
      finished: false,
      progress: {
        current: 0,
        max: 0,
        percent: 0
      }
    };
    this.exampleData = {
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
      maxClasses: 3,
      courseHours: 10,
      courseHoursByCourse: {}
    };

    this.loadExample = function () {
      angular.copy(this.exampleData.courses, appData.courses);
      angular.copy(this.exampleData.classes, appData.classes);
      angular.copy(this.exampleData.inputTimetable, appData.inputTimetable);
      this.status.emptyInput = isDeepEmpty(appData.inputTimetable);
      appData.maxClasses = this.exampleData.maxClasses;
      appData.courseHours = this.exampleData.courseHours;
      angular.copy(this.exampleData.courseHoursByCourse, appData.courseHoursByCourse);
    };

    this.onDataChange = function (value, oldValue) {
      if (value === oldValue) return;
      this.status.emptyInput = isDeepEmpty(appData.inputTimetable);
      if (appData.timetable.length || this.status.running || this.status.paused) {
        this.status.inputChanged = true;
      }
      this.save();
    }.bind(this);

    this.save = function () {
      localStorage.dump('data', appData);
      localStorage.dump('status', this.status);
    };

    this.load = function () {
      var savedData = localStorage.load('data');
      if (savedData !== null) {
        if (savedData.version !== appData.version) {
          localStorage.removeItem('data');
          return;
        }
        angular.copy(savedData.courses, appData.courses);
        angular.copy(savedData.classes, appData.classes);
        angular.copy(savedData.inputTimetable, appData.inputTimetable);
        this.status.emptyInput = isDeepEmpty(appData.inputTimetable);
        appData.maxClasses = savedData.maxClasses;
        appData.courseHours = savedData.courseHours;
        angular.copy(savedData.courseHoursByCourse, appData.courseHoursByCourse);
        angular.copy(savedData.timetable, appData.timetable);
      }
      var savedStatus = localStorage.load('status');
      if (savedStatus !== null) {
        // Only selected few status variables are restored.
        this.status.inputChanged = savedStatus.inputChanged;
        this.status.showHelp = savedStatus.showHelp;
      }
      if (!appData.timetable.length) {
        // inputChanged can be true if input was changed during searching.
        // It should be false when reloaded if timetable is empty.
        this.status.inputChanged = false;
      }
    };

    this.addCourse = function (course) {
      if (!course) return;
      if (appData.courses.indexOf(course) === -1) {
        appData.courses.push(course);
      }
    };

    this.removeCourse = function (course) {
      var i = appData.courses.indexOf(course);
      if (i !== -1) {
        appData.courses.splice(i, 1);
        // Remove data containing the removed course from inputTimetable.
        var isNotRemovedCourse = function (x) { return course !== x; };
        for (var c = 0; c < this.numDays; c++) {
          for (var r = 0; r < this.numPeriods; r++) {
            var timeInfo = appData.inputTimetable[c][r];
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
      if (appData.classes.indexOf(klass) === -1) {
        appData.classes.push(klass);
      }
    };

    this.removeClass = function (klass) {
      var i = appData.classes.indexOf(klass);
      if (i !== -1) {
        appData.classes.splice(i, 1);
        // Remove data containing the removed class from inputTimetable
        var isNotRemovedClass = function (x) { return klass !== x; };
        for (var c = 0; c < this.numDays; c++) {
          for (var r = 0; r < this.numPeriods; r++) {
            var timeInfo = appData.inputTimetable[c][r];
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

    this.start = function () {
      this.solver.start();
    };

    this.pause = function () {
      this.solver.pause();
    };

    this.resume = function () {
      this.solver.resume();
    };

    var status = this.status;
    var callbacks = {
      started: function () {
        $timeout(function () {
          appData.timetable.length = 0;
          status.inputChanged = false;
          status.showHelp = false;
          status.running = true;
          status.paused = false;
          status.finished = false;
          status.progress.current = 0;
          status.progress.max = 0;
          status.progress.percent = 0;
        });
      },
      resumed: function () {
        $timeout(function () {
          status.showHelp = false;
          status.running = true;
          status.paused = false;
        });
      },
      paused: function () {
        $timeout(function () {
          if (!status.finished) {
            status.running = false;
            status.paused = true;
          }
        });
      },
      progress: function (numSolved, numMaxRun) {
        $timeout(function () {
          status.progress.current = numSolved;
          status.progress.max = numMaxRun;
          status.progress.percent = numSolved / numMaxRun * 100;
        });
      },
      solutionfound: function (fitness, timetable) {
        $timeout(function () {
          status.running = false;
          status.finished = true;
          angular.copy(timetable, appData.timetable);
          appService.save();
        });
      },
      unsolvableproblem: function () {
        console.log('unsolvable');
      }
    };
    this.solver.on(callbacks);

    this.load();
  });
