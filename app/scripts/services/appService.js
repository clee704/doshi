/* global range, isDeepEmpty, mapObj */
'use strict';

angular.module('doshi')
  .service('appService', function ($window, $timeout, Solver, problemArgs, localStorage, NUM_DAYS, NUM_PERIODS) {
    var appService = this;

    appService.version = 0;  // Used to invalidate old saved data
    appService.days = range(NUM_DAYS);
    appService.periods = range(NUM_PERIODS);
    appService.solver = new Solver();
    var status = appService.status = {
      emptyInput: true,
      inputChanged: false,
      showHelp: true,
      starting: false,
      running: false,
      pausing: false,
      paused: false,
      finished: true,
      progress: {
        current: 0,
        max: 0,
        percent: 0
      }
    };
    appService.timetable = [];
    appService.timetableStats = {
      daysByCourse: {},
      coursesByClass: {}
    };
    appService.exampleData = {
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

    appService.loadExample = function () {
      angular.copy(appService.exampleData.courses, problemArgs.courses);
      angular.copy(appService.exampleData.classes, problemArgs.classes);
      angular.copy(appService.exampleData.inputTimetable, problemArgs.inputTimetable);
      appService.status.emptyInput = isDeepEmpty(problemArgs.inputTimetable);
      problemArgs.maxClasses = appService.exampleData.maxClasses;
      problemArgs.courseHours = appService.exampleData.courseHours;
      angular.copy(appService.exampleData.courseHoursByCourse, problemArgs.courseHoursByCourse);
    };

    appService.onDataChange = function (value, oldValue) {
      if (value === oldValue) return;
      status.emptyInput = isDeepEmpty(problemArgs.inputTimetable);
      if (appService.timetable.length || status.running || status.paused) {
        status.inputChanged = true;
      }
      appService.save();
    };

    appService.save = function () {
      var data = {
        version: appService.version,
        status: appService.status,
        timetable: appService.timetable,
        timetableStats: appService.timetableStats,
        problemArgs: problemArgs
      };
      localStorage.dump('doshiSavedData', data);
    };

    appService.load = function () {
      var savedData = localStorage.load('doshiSavedData');
      if (savedData === null) {
        // Nothing saved or parse failed.
        return;
      }
      if (savedData.version !== appService.version) {
        // Old saved data
        localStorage.removeItem('doshiSavedData');
        return;
      }
      angular.copy(savedData.problemArgs, problemArgs);
      angular.copy(savedData.timetable, appService.timetable);
      angular.copy(savedData.timetableStats, appService.timetableStats);
      appService.status.emptyInput = savedData.status.emptyInput;
      appService.status.inputChanged = savedData.status.inputChanged;
      appService.status.showHelp = savedData.status.showHelp;
      if (!appService.timetable.length) {
        // inputChanged can be true if input was changed during searching.
        // It should be false when reloaded if timetable is empty.
        appService.status.inputChanged = false;
      }
    };

    appService.addCourse = function (course) {
      if (!course) return;
      if (problemArgs.courses.indexOf(course) === -1) {
        problemArgs.courses.push(course);
        problemArgs.courses.sort();
      }
    };

    appService.removeCourse = function (course) {
      var index = problemArgs.courses.indexOf(course);
      if (index !== -1) {
        problemArgs.courses.splice(index, 1);
        // Remove data containing the removed course from inputTimetable.
        var isNotRemovedCourse = function (x) { return course !== x; };
        appService.forEachInputCell(function (cell) {
          var courses = cell[1];
          if (!courses) return;
          angular.copy(courses.filter(isNotRemovedCourse), courses);
        });
        delete problemArgs.courseHoursByCourse[course];
      }
    };

    appService.addClass = function (klass) {
      if (!klass) return;
      if (problemArgs.classes.indexOf(klass) === -1) {
        problemArgs.classes.push(klass);
        problemArgs.classes.sort();
      }
    };

    appService.removeClass = function (klass) {
      var index = problemArgs.classes.indexOf(klass);
      if (index !== -1) {
        problemArgs.classes.splice(index, 1);
        // Remove data containing the removed class from inputTimetable
        var isNotRemovedClass = function (x) { return klass !== x; };
        appService.forEachInputCell(function (cell) {
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

    appService.start = function () {
      if (!(status.finished || status.paused)) return;
      appService.timetable.length = 0;
      status.inputChanged = false;
      status.showHelp = false;
      status.starting = true;
      status.running = false;
      status.pausing = false;
      status.paused = false;
      status.finished = false;
      status.progress.current = 0;
      status.progress.max = 0;
      status.progress.percent = 0;
      appService.solver.start();
    };

    appService.pause = function () {
      if (!status.running) return;
      status.starting = false;
      status.running = false;
      status.pausing = true;
      status.paused = false;
      status.finished = false;
      appService.solver.pause();
    };

    appService.resume = function () {
      if (!status.paused) return;
      status.showHelp = false;
      status.starting = true;
      status.running = false;
      status.pausing = false;
      status.paused = false;
      status.finished = false;
      appService.solver.resume();
    };

    appService.forEachInputCell = function (callback) {
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

    appService.forEachAssignment = function (callback) {
      for (var day = 0; day < appService.timetable.length; day++) {
        var column = appService.timetable[day];
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

    appService.solver.on({
      started: function () {
        $timeout(function () {
          if (!status.starting) return;
          status.starting = false;
          status.running = true;
          status.pausing = false;
          status.paused = false;
          status.finished = false;
        });
      },
      resumed: function () {
        $timeout(function () {
          if (!status.starting) return;
          status.starting = false;
          status.running = true;
          status.pausing = false;
          status.paused = false;
          status.finished = false;
        });
      },
      paused: function () {
        $timeout(function () {
          if (!status.pausing) return;
          status.starting = false;
          status.running = false;
          status.pausing = false;
          status.paused = true;
          status.finished = false;
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
          if (!status.running) return;
          status.starting = false;
          status.running = false;
          status.pausing = false;
          status.paused = false;
          status.finished = true;
          angular.copy(timetable, appService.timetable);
          buildTimetableStats();
          appService.save();
        });
      },
      unsolvableproblem: function (/*exception*/) {
        $window.alert('조건에 맞는 시간표를 만들 수 없습니다. 최대 수업 크기를 늘리거나 제한을 없앤 뒤 다시 시도해보세요.');
      }
    });

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

    appService.load();
  });
