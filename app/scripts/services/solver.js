/* global Problem */
'use strict';

angular.module('doshi')
  .factory('Solver', function ($timeout, $log, problemArgs, time, random, localStorage) {

    function Solver() {
      this._workerManager = new WorkerManager({
        onStarted: this.onStarted.bind(this),
        onResumed: this.onResumed.bind(this),
        onPaused: this.onPaused.bind(this),
        onResult: this.onResult.bind(this)
      });
      this._numSolved = 0;
      this._numMaxRun = 1000;
      this._startTime = null;
      this._minFitness = null;
      this._bestTimetable = null;
      this._callbacks = {};
    }

    Solver.prototype.start = function () {
      $log.debug('Solver started!');
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
      this._workerManager.setProblem(args);
      this._numSolved = 0;
      this._minFitness = null;
      this._bestTimetable = null;
      this._startTime = time();
      this._workerManager.start();
    };

    Solver.prototype.resume = function () {
      this._workerManager.resume();
    };

    Solver.prototype.pause = function () {
      this._workerManager.pause();
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

    Solver.prototype.onStarted = function () {
      this._callback('started');
    };

    Solver.prototype.onResumed = function () {
      this._callback('resumed');
    };

    Solver.prototype.onPaused = function () {
      this._callback('paused');
    };

    Solver.prototype.onResult = function (fitness, timetable) {
      this._numSolved += 1;
      if (this._minFitness === null || this.problem.compareFitness(fitness, this._minFitness) <= 0) {
        this._minFitness = fitness;
        this._bestTimetable = timetable;
        this._printSolutionInfo();
      }
      this._callback('progress', this._numSolved, this._numMaxRun);
      if (this._numSolved === this._numMaxRun) {
        this._workerManager.stop();
        this._callback('solutionfound', this._minFitness,
            this.problem.convertTimetable(this._bestTimetable));
        $log.debug('Solution found!');
        this._printSolutionInfo();
      }
    };

    Solver.prototype._printSolutionInfo = function () {
      var elapsedTime = (time() - this._startTime) / 1000;
      $log.debug('--- elapsed time: ' + elapsedTime.toFixed(6) +
          ', num solved: ' + this._numSolved +
          ', rate: ' + (this._numSolved / elapsedTime).toFixed(6) +
          ', fitness: ' + this._minFitness);
    };


    // Scales number of workers depending on the actual performance.
    // We prefer fewer workers unless the performance gain is more than
    // a certain threshold (See _alpha below).
    function WorkerManager(callbacks) {
      this._callbacks = callbacks;
      this._problemArgs = null;
      this._state = 'init';
      this._scale = 1;                  // estimated number of cores for which the algorithm is the most effective
      this._workers = [];
      this._duration = 10;              // number of seconds before transition occurs
      this._rate = 0;                   // average number of problems solved per second
      this._alpha = 1.1;                // minimum performance gain to justify more workers
      this._beta = 1.15;                // maximum performance change to stay stable
      this._probabilities = [0, 1, 0];  // stable, up, down
      this._timer = null;
      this._numProblemSolved = 0;
      this._load();
    }

    WorkerManager.prototype.setProblem = function (args) {
      for (var i = 0; i < this._workers.length; i++) {
        this._workers[i].setProblem(args);
      }
      this._problemArgs = args;
    };

    WorkerManager.prototype.start = function () {
      this._resume('onStarted');
    };

    WorkerManager.prototype.resume = function () {
      this._resume('onResumed');
    };

    WorkerManager.prototype._resume = function (callbackName) {
      this._startStateMachine();
      this._callbacks[callbackName]();
    };

    WorkerManager.prototype.pause = function () {
      this._stopStateMachine();
    };

    WorkerManager.prototype.stop = function () {
      this._stopStateMachine();
      while (this._workers.length) {
        this._removeWorker();
      }
    };

    WorkerManager.prototype._startStateMachine = function () {
      var manager = this;

      manager._state = 'init';
      manager._numProblemSolved = 0;
      manager._scaleReset();
      for (var i = 0; i < manager._workers.length; i++) {
        manager._workers[i].start();
      }

      function loop() {
        var rate = manager._numProblemSolved / manager._duration;
        $log.debug('state ' + manager._state + ' has ended.');
        if (manager._state !== 'init') {
          $log.debug('rate: ' + rate);
          $log.debug('previous rate: ' + manager._rate);
        }
        var nextState;
        switch (manager._state) {
        case 'init':
          nextState = 'stable';
          break;
        case 'stable':
          if (rate > manager._rate * manager._beta) {
            manager._updateProbabilities(0, 0.05, 0);
          } else if (rate * manager._beta < manager._rate) {
            manager._updateProbabilities(0, 0, 0.05);
          }
          nextState = random.choice(['stable', 'up', 'down'], manager._probabilities);
          if (manager._scale === 1 && nextState === 'down') nextState = 'up';
          if (nextState === 'up') {
            manager._scaleUp();
          } else if (nextState === 'down') {
            manager._scaleDown();
          }
          manager._rate = rate;
          break;
        case 'up':
          if (rate > manager._rate * manager._alpha) {
            nextState = manager._state;
            manager._scale = manager._workers.length;
            manager._scaleUp();
            manager._rate = rate;
          } else {
            nextState = 'stable';
            manager._scaleDown();
            manager._updateProbabilities(0.93, 0.01, 0.06);
          }
          break;
        case 'down':
          if (rate * manager._alpha > manager._rate) {
            nextState = manager._state;
            manager._scale = manager._workers.length;
            if (manager._scale > 1) {
              manager._scaleDown();
            } else {
              nextState = 'stable';
              manager._updateProbabilities(0.93, 0.07, 0);
            }
            manager._rate = rate;
          } else {
            nextState = 'stable';
            manager._scaleUp();
            manager._updateProbabilities(0.93, 0.06, 0.01);
          }
          break;
        }
        manager._state = nextState;
        manager._numProblemSolved = 0;
        manager._save();
        $log.debug('###');
        $log.debug('state ' + manager._state + ' is running...');
        $log.debug('scale: ' + manager._scale);
        $log.debug('workers: ' + manager._workers.length);
        if (manager._state === 'stable') {
          $log.debug('probabilities: ' + manager._probabilities);
        }
        manager._timer = $timeout(loop, manager._duration * 1000);
      }

      this._timer = $timeout(loop, 5000);
    };

    WorkerManager.prototype._stopStateMachine = function () {
      $timeout.cancel(this._timer);
      for (var i = 0; i < this._workers.length; i++) {
        this._workers[i].pause();
      }
    };

    WorkerManager.prototype._addWorker = function () {
      var worker = new WorkerWrapper(this, 'worker-' + this._workers.length);
      worker.setProblem(this._problemArgs);
      this._workers.push(worker);
      return worker;
    };

    WorkerManager.prototype._removeWorker = function () {
      var worker = this._workers.pop();
      worker.terminate();
    };

    WorkerManager.prototype._scaleUp = function () {
      $log.debug('scaling up...');
      var worker = this._addWorker();
      worker.start();
    };

    WorkerManager.prototype._scaleDown = function () {
      $log.debug('scaling down...');
      this._removeWorker();
    };

    WorkerManager.prototype._scaleReset = function () {
      var d = this._scale - this._workers.length;
      if (!d) return;
      var n = d > 0 ? d : -d;
      for (var i = 0; i < n; i++) {
        if (d > 0) {
          this._addWorker();
        } else {
          this._removeWorker();
        }
      }
    };

    WorkerManager.prototype._updateProbabilities = function (a, b, c) {
      var p = this._probabilities[0];
      var q = this._probabilities[1];
      var r = this._probabilities[2];
      $log.debug(p, q, r, '×', a, b, c);
      p = (p + a);
      q = (q + b);
      r = (r + c);
      var t = p + q + r;
      p /= t;
      q /= t;
      r /= t;
      $log.debug('->', p, q, r);
      this._probabilities = [p, q, r];
    };

    WorkerManager.prototype._load = function () {
      this._scale = localStorage.load('WorkerManager.scale', this._scale);
      this._rate = localStorage.load('WorkerManager.rate', this._scale);
      this._probabilities = localStorage.load('WorkerManager.probabilities', this._probabilities);
    };

    WorkerManager.prototype._save = function () {
      localStorage.dump('WorkerManager.scale', this._scale);
      localStorage.dump('WorkerManager.rate', this._rate);
      localStorage.dump('WorkerManager.probabilities', this._probabilities);
    };

    WorkerManager.prototype.onPaused = function () {
      var runningWorkers = this._workers.filter(function (worker) { return worker.running; });
      var numRunningWorkers = runningWorkers.length;
      if (numRunningWorkers === 0) {
        this._callbacks.onPaused();
      }
    };

    WorkerManager.prototype.onResult = function (fitness, timetable) {
      this._numProblemSolved += 1;
      this._callbacks.onResult(fitness, timetable);
    };


    function WorkerWrapper(manager, name) {
      this.running = false;
      this.paused = false;
      this._raw = new Worker('scripts/worker.js');
      this._raw.addEventListener('message', this._onMessage.bind(this), false);
      this._raw.addEventListener('error', this._onError.bind(this), false);
      this._manager = manager;
      this._name = name;
    }

    WorkerWrapper.prototype.setProblem = function (args) {
      this._raw.postMessage({method: 'setProblem', args: [args]});
    };

    WorkerWrapper.prototype.start = function () {
      this._raw.postMessage({method: 'start'});
      this.running = true;
      this.paused = false;
    };

    WorkerWrapper.prototype.pause = function () {
      this._raw.postMessage({method: 'pause'});
    };

    WorkerWrapper.prototype.terminate = function () {
      this._raw.terminate();
    };

    WorkerWrapper.prototype.onResult = function (fitness, timetable) {
      this._manager.onResult(fitness, timetable);
    };

    WorkerWrapper.prototype.onPaused = function () {
      this.running = false;
      this.paused = true;
      this._manager.onPaused();
    };

    WorkerWrapper.prototype._onMessage = function (event) {
      var data = event.data;
      var func = this[data.method];
      if (typeof func === 'function') {
        func.apply(this, data.args);
      }
    };

    WorkerWrapper.prototype._onError = function (event) {
      $log.warn('An error occurred in Worker[' + this._name + ']: ' +
          event.message + ' (' + event.filename + ': ' + event.lineno + ')');
    };


    return Solver;
  });
