/* global addEventListener, postMessage, importScripts, Problem, hillClimbing */
'use strict';


function DoshiWorker() {
  this.problem = undefined;
  this.paused = false;
  this._init();
}

DoshiWorker.prototype.setProblem = function (args) {
  this.problem = new Problem(args);
};

DoshiWorker.prototype.start = function () {
  this.paused = false;
  var loop = function () {
    if (!this.paused) {
      this.problem.initRandom();
      var fitness = hillClimbing(this.problem);
      postMessage({method: 'onResult', args: [fitness, this.problem.timetable]});
      setTimeout(loop);
    } else {
      postMessage({method: 'onPaused'});
    }
  }.bind(this);
  loop();
};

DoshiWorker.prototype.pause = function () {
  this.paused = true;
};

DoshiWorker.prototype._init = function () {
  addEventListener('message', function (event) {
    var data = event.data;
    var func = this[data.method];
    if (typeof func === 'function') {
      func.apply(this, data.args);
    }
  }.bind(this), false);
};


// This script is embedded in index.html for usemin to be able to process.
// We should check if we are in normal context or in Worker context.
if (typeof importScripts !== 'undefined') {

  if (@@production) {
    importScripts('lib.js');
  } else {
    importScripts('lib/util.js', 'lib/algorithm.js', 'lib/problem.js');
  }
  new DoshiWorker();
}
