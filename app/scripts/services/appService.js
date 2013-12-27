/* global range, isDeepEmpty, mapObj */
'use strict';

angular.module('doshi')
  .service('appService', function ($timeout, Solver, problemArgs, localStorage) {
    var appService = this;

    this.version = 0;  // Used to invalidate old saved data
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
    this.timetable = [];
    this.timetableStats = {
      daysByCourse: {},
      coursesByClass: {}
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
          [['2-2']]
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
      maxClasses: 2,
      courseHours: 9,
      courseHoursByCourse: {}
    };

    this.loadExample = function () {
      angular.copy(this.exampleData.courses, problemArgs.courses);
      angular.copy(this.exampleData.classes, problemArgs.classes);
      angular.copy(this.exampleData.inputTimetable, problemArgs.inputTimetable);
      this.status.emptyInput = isDeepEmpty(problemArgs.inputTimetable);
      problemArgs.maxClasses = this.exampleData.maxClasses;
      problemArgs.courseHours = this.exampleData.courseHours;
      angular.copy(this.exampleData.courseHoursByCourse, problemArgs.courseHoursByCourse);
    };

    this.onDataChange = function (value, oldValue) {
      if (value === oldValue) return;
      this.status.emptyInput = isDeepEmpty(problemArgs.inputTimetable);
      if (this.timetable.length || this.status.running || this.status.paused) {
        this.status.inputChanged = true;
      }
      this.save();
    }.bind(this);

    this.save = function () {
      var data = {
        version: this.version,
        status: this.status,
        timetable: this.timetable,
        timetableStats: this.timetableStats,
        problemArgs: problemArgs
      };
      localStorage.dump('doshiSavedData', data);
    };

    this.load = function () {
      var savedData = localStorage.load('doshiSavedData');
      if (savedData === null) {
        // Nothing saved or parse failed.
        return;
      }
      if (savedData.version !== this.version) {
        // Old saved data
        localStorage.removeItem('doshiSavedData');
        return;
      }
      angular.copy(savedData.problemArgs, problemArgs);
      angular.copy(savedData.timetable, this.timetable);
      angular.copy(savedData.timetableStats, this.timetableStats);
      this.status.emptyInput = savedData.status.emptyInput;
      this.status.inputChanged = savedData.status.inputChanged;
      this.status.showHelp = savedData.status.showHelp;
      if (!this.timetable.length) {
        // inputChanged can be true if input was changed during searching.
        // It should be false when reloaded if timetable is empty.
        this.status.inputChanged = false;
      }
    };

    this.addCourse = function (course) {
      if (!course) return;
      if (problemArgs.courses.indexOf(course) === -1) {
        problemArgs.courses.push(course);
      }
    };

    this.removeCourse = function (course) {
      var i = problemArgs.courses.indexOf(course);
      if (i !== -1) {
        problemArgs.courses.splice(i, 1);
        // Remove data containing the removed course from inputTimetable.
        var isNotRemovedCourse = function (x) { return course !== x; };
        for (var c = 0; c < this.numDays; c++) {
          for (var r = 0; r < this.numPeriods; r++) {
            var timeInfo = problemArgs.inputTimetable[c][r];
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
      if (problemArgs.classes.indexOf(klass) === -1) {
        problemArgs.classes.push(klass);
      }
    };

    this.removeClass = function (klass) {
      var i = problemArgs.classes.indexOf(klass);
      if (i !== -1) {
        problemArgs.classes.splice(i, 1);
        // Remove data containing the removed class from inputTimetable
        var isNotRemovedClass = function (x) { return klass !== x; };
        for (var c = 0; c < this.numDays; c++) {
          for (var r = 0; r < this.numPeriods; r++) {
            var timeInfo = problemArgs.inputTimetable[c][r];
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
          appService.timetable.length = 0;
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
          angular.copy(timetable, appService.timetable);
          buildTimetableStats();
          appService.save();
        });
      },
      unsolvableproblem: function (exception) {
        console.log('unsolvable', exception);
      }
    };
    this.solver.on(callbacks);

    function buildTimetableStats() {
      var zero = function () { return 0; };
      var stats = {
        daysByCourse: mapObj(problemArgs.courses, function () {
          return mapObj(appService.dayIndices, zero);
        }),
        sumDaysByCourse: mapObj(problemArgs.courses, zero),
        coursesByClass: mapObj(problemArgs.classes, function () {
          return mapObj(problemArgs.courses, zero);
        }),
        sumCoursesByClass: mapObj(problemArgs.classes, zero)
      };
      for (var day = 0; day < appService.numDays; day++) {
        var column = appService.timetable[day];
        if (!column) continue;
        for (var period = 0; period < appService.numPeriods; period++) {
          var assignments = column[period];
          if (!assignments) continue;
          for (var k = 0; k < assignments.length; k++) {
            var course = assignments[k][0];
            var classGroup = assignments[k][1];
            stats.daysByCourse[course][day] += 1;
            stats.sumDaysByCourse[course] += 1;
            for (var l = 0; l < classGroup.length; l++) {
              var klass = classGroup[l];
              stats.coursesByClass[klass][course] += 1;
              stats.sumCoursesByClass[klass] += 1;
            }
          }
        }
      }
      angular.copy(stats, appService.timetableStats);
    }

    this.load();
  });
