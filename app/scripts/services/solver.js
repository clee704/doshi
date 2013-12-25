/* global Problem */
'use strict';

angular.module('doshi')
  .factory('Solver', function (appData, time) {

    function Solver() {
      this._workers = [];
      this._numRunningWorkers = 0;
      this._numSolved = 0;
      this._numMaxRun = 200;
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
        courses: appData.courses,
        classes: appData.classes,
        input_timetable: appData.inputTimetable,
        max_classes: appData.maxClasses,
        course_hours: appData.courseHours
      };
      try {
        this.problem = new Problem(args);
      } catch (exception) {
        this._callback('unsolvableproblem');
        return;
      }
      for (var i = 0; i < this._workers.length; i++) {
        this._workers[i].call('setProblem', args);
      }
      this._numSolved = 0;
      this._minFitness = null;
      this._bestTimetable = null;
      this._startTime = time();
      this._resume();
      this._callback('started');
    };

    Solver.prototype._resume = function () {
      for (var i = 0; i < this._workers.length; i++) {
        this._workers[i].call('start');
      }
      this._numRunningWorkers = this._workers.length;
    };

    Solver.prototype.resume = function () {
      this._resume();
      this._callback('resumed');
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
      if (this._minFitness === null || this.problem.compare_fitness(fitness, this._minFitness) < 0) {
        this._minFitness = fitness;
        this._bestTimetable = timetable;
        this._debug();
      }
      this._callback('progress', this._numSolved, this._numMaxRun);
      if (this._numSolved === this._numMaxRun) {
        this._pause();
        this._callback('solutionfound', this._minFitness,
            this.problem.convert_timetable(this._bestTimetable));
        this._debug();
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
