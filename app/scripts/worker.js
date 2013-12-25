/* global addEventListener, postMessage, importScripts, Problem, hill_climbing */
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
      this.problem.init_random();
      var fitness = hill_climbing(this.problem);
      this._callParent('onResult', fitness, this.problem.timetable);
      setTimeout(loop);
    } else {
      this._callParent('onPaused');
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

DoshiWorker.prototype._callParent = function () {
  var data = [].slice.apply(arguments);
  var method = data[0];
  var args = data.slice(1);
  postMessage({method: method, args: args});
};


// This script is embedded in index.html for usemin to be able to process.
// We should check if we are in normal context or in Worker context.
if (typeof importScripts !== 'undefined') {

  // Try to import the concatenated & minified file first (production)
  // then the original files (development).
  try {
    importScripts('lib.js');
  } catch (exception) {
    importScripts('lib/util.js', 'lib/algorithm.js', 'lib/problem.js');
  }

  new DoshiWorker();
}
