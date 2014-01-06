/* global Problem */
'use strict';

angular.module('doshi')
  .factory('Solver', function ($timeout, problemArgs, time, debug) {

    function Solver() {
      this._workers = [];
      this._numRunningWorkers = 0;
      this._numSolved = 0;
      this._numMaxRun = 1000;
      this._startTime = null;
      this._minFitness = null;
      this._bestTimetable = null;
      this._callbacks = {};
      this._init();
    }

    Solver.prototype._init = function () {
      // Create one worker by default. The number of workers are changed during
      // runtime so that maximum performance is achieved.
      for (var i = 0; i < 3; i++) {
        this._workers.push(new DoshiWorker(this));
      }
    };

    Solver.prototype.start = function () {
      var args = {
        courses: problemArgs.courses,
        classes: problemArgs.classes,
        inputTimetable: problemArgs.inputTimetable,
        maxClasses: problemArgs.maxClasses,
        courseHours: this._getCourseHours()
      };
      try {
        this.problem = new Problem(args);
      } catch (exception) {
        this._callback('unsolvableproblem', exception);
        return;
      }
      for (var i = 0; i < this._workers.length; i++) {
        this._workers[i].call('setProblem', args);
      }
      this._numSolved = 0;
      this._minFitness = null;
      this._bestTimetable = null;
      this._startTime = time();
      this._resume('started');
    };

    Solver.prototype._getCourseHours = function () {
      // Select courseHours or courseHoursByCourse depending on provided values.
      var courseHoursByCourse = problemArgs.courseHoursByCourse;
      var useObj = false;
      var values = [];
      var sum = 0;
      var course, v;
      for (course in courseHoursByCourse) {
        if (!courseHoursByCourse.hasOwnProperty(course)) continue;
        v = courseHoursByCourse[course];
        if (v !== undefined && v !== null) {
          useObj = true;
          values.push(v);
          sum += v;
        }
      }
      if (!useObj) {
        // No specific values for each course.
        return problemArgs.courseHours;
      }
      if (values.length === problemArgs.courses.length) {
        // No missing values.
        return courseHoursByCourse;
      }
      // Fill missing values with courseHours (if defined) or
      // the average of existing values.
      var fill = problemArgs.courseHours !== null ?
          problemArgs.courseHours : Math.round(sum / values.length);
      for (var i = 0; i < problemArgs.courses.length; i++) {
        course = problemArgs.courses[i];
        v = courseHoursByCourse[course];
        if (v !== undefined && v !== null) continue;
        courseHoursByCourse[course] = fill;
      }
      return courseHoursByCourse;
    };

    Solver.prototype._resume = function (eventName) {
      // Start workers with random gaps between starting times.
      // This makes the transition of progress values more smooth and natural.
      var solver = this;
      var i = 0;
      function start() {
        solver._workers[i].call('start');
        i += 1;
        solver._numRunningWorkers++;
        if (i < solver._workers.length) {
          $timeout(start, 200 + Math.random() * 800);
        } else {
          solver._callback(eventName);
        }
      }
      start();
    };

    Solver.prototype.resume = function () {
      this._resume('resumed');
    };

    Solver.prototype.pause = function () {
      this._pause();
    };

    Solver.prototype._pause = function () {
      for (var i = 0; i < this._workers.length; i++) {
        this._workers[i].call('pause');
      }
    };

    Solver.prototype.on = function (config) {
      for (var eventName in config) {
        if (!config.hasOwnProperty(eventName)) continue;
        this._callbacks[eventName] = config[eventName];
      }
    };

    Solver.prototype._callback = function () {
      var args = [].slice.call(arguments);
      var eventName = args[0];
      var eventArgs = args.slice(1);
      this._callbacks[eventName].apply(undefined, eventArgs);
    };

    // Methods called by workers.
    Solver.prototype.onResult = function (fitness, timetable) {
      this._numSolved += 1;
      if (this._minFitness === null || this.problem.compareFitness(fitness, this._minFitness) <= 0) {
        this._minFitness = fitness;
        this._bestTimetable = timetable;
        if (debug) this._debug();
      }
      this._callback('progress', this._numSolved, this._numMaxRun);
      if (this._numSolved === this._numMaxRun) {
        this._pause();
        this._callback('solutionfound', this._minFitness,
            this.problem.convertTimetable(this._bestTimetable));
        if (debug) this._debug();
      }
    };

    Solver.prototype._debug = function () {
      var elapsedTime = (time() - this._startTime) / 1000;
      console.log('elapsed time: ' + elapsedTime.toFixed(6) +
          ', num solved: ' + this._numSolved +
          ', rate: ' + (this._numSolved / elapsedTime).toFixed(6) +
          ', fitness: ' + this._minFitness);
    };

    Solver.prototype.onPaused = function () {
      this._numRunningWorkers -= 1;
      if (this._numRunningWorkers === 0) {
        this._callback('paused');
      }
    };

    Solver.prototype._onMessage = function (event) {
      var data = event.data;
      var func = this[data.method];
      if (typeof func === 'function') {
        func.apply(this, data.args);
      }
    };

    Solver.prototype._onError = function (event) {
      console.log('An error occurred in Worker: ' + event.message +
          ' (' + event.filename + ': ' + event.lineno + ')');
    };

    function DoshiWorker(solver) {
      this._raw = new Worker('scripts/worker.js');
      this._raw.addEventListener('message', solver._onMessage.bind(solver), false);
      this._raw.addEventListener('error', solver._onError.bind(solver), false);
    }

    DoshiWorker.prototype.call = function () {
      var data = [].slice.apply(arguments);
      var method = data[0];
      var args = data.slice(1);
      this._raw.postMessage({method: method, args: args});
    };

    return Solver;
  });
