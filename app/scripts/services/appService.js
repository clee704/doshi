/* global range, isDeepEmpty, mapObj */
'use strict';

angular.module('doshi')
  .service('appService', function ($timeout, Solver, problemArgs, localStorage, NUM_DAYS, NUM_PERIODS) {
    var appService = this;

    this.version = 0;  // Used to invalidate old saved data
    this.days = range(NUM_DAYS);
    this.periods = range(NUM_PERIODS);
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
        problemArgs.courses.sort();
      }
    };

    this.removeCourse = function (course) {
      var index = problemArgs.courses.indexOf(course);
      if (index !== -1) {
        problemArgs.courses.splice(index, 1);
        // Remove data containing the removed course from inputTimetable.
        var isNotRemovedCourse = function (x) { return course !== x; };
        this.forEachInputCell(function (cell) {
          var courses = cell[1];
          if (!courses) return;
          angular.copy(courses.filter(isNotRemovedCourse), courses);
        });
        delete problemArgs.courseHoursByCourse[course];
      }
    };

    this.addClass = function (klass) {
      if (!klass) return;
      if (problemArgs.classes.indexOf(klass) === -1) {
        problemArgs.classes.push(klass);
        problemArgs.classes.sort();
      }
    };

    this.removeClass = function (klass) {
      var index = problemArgs.classes.indexOf(klass);
      if (index !== -1) {
        problemArgs.classes.splice(index, 1);
        // Remove data containing the removed class from inputTimetable
        var isNotRemovedClass = function (x) { return klass !== x; };
        this.forEachInputCell(function (cell) {
          var classes = cell[0];
          if (!classes) return;
          angular.copy(classes.filter(isNotRemovedClass), classes);
          var courses = cell[1];
          if (classes.length === 0 && courses) {
            // If there are no classes, remove all courses.
            courses.length = 0;
          }
        });
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

    this.forEachInputCell = function (callback) {
      for (var day = 0; day < problemArgs.inputTimetable.length; day++) {
        var column = problemArgs.inputTimetable[day];
        if (!column) continue;
        for (var period = 0; period < column.length; period++) {
          var cell = column[period];
          if (!cell) continue;
          callback.call(undefined, cell);
        }
      }
    };

    this.forEachAssignment = function (callback) {
      for (var day = 0; day < this.timetable.length; day++) {
        var column = this.timetable[day];
        if (!column) continue;
        for (var period = 0; period < column.length; period++) {
          var assignments = column[period];
          if (!assignments) continue;
          for (var k = 0; k < assignments.length; k++) {
            var assignment = assignments[k];
            if (!assignment) continue;
            callback.call(undefined, assignment, day, period);
          }
        }
      }
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
          return mapObj(appService.days, zero);
        }),
        sumDaysByCourse: mapObj(problemArgs.courses, zero),
        coursesByClass: mapObj(problemArgs.classes, function () {
          return mapObj(problemArgs.courses, zero);
        }),
        sumCoursesByClass: mapObj(problemArgs.classes, zero)
      };
      appService.forEachAssignment(function (assignment, day) {
        var course = assignment[0];
        var classGroup = assignment[1];
        stats.daysByCourse[course][day] += 1;
        stats.sumDaysByCourse[course] += 1;
        for (var i = 0; i < classGroup.length; i++) {
          var klass = classGroup[i];
          stats.coursesByClass[klass][course] += 1;
          stats.sumCoursesByClass[klass] += 1;
        }
      });
      angular.copy(stats, appService.timetableStats);
    }

    this.load();
  });
