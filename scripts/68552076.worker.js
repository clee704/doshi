"use strict";function DoshiWorker(){this.problem=void 0,this.paused=!1,this._init()}if(DoshiWorker.prototype.setProblem=function(a){this.problem=new Problem(a)},DoshiWorker.prototype.start=function(){this.paused=!1;var a=function(){if(this.paused)this._callParent("onPaused");else{this.problem.initRandom();var b=hillClimbing(this.problem);this._callParent("onResult",b,this.problem.timetable),setTimeout(a)}}.bind(this);a()},DoshiWorker.prototype.pause=function(){this.paused=!0},DoshiWorker.prototype._init=function(){addEventListener("message",function(a){var b=a.data,c=this[b.method];"function"==typeof c&&c.apply(this,b.args)}.bind(this),!1)},DoshiWorker.prototype._callParent=function(){var a=[].slice.apply(arguments),b=a[0],c=a.slice(1);postMessage({method:b,args:c})},"undefined"!=typeof importScripts){try{importScripts("7999154d.lib.js")}catch(exception){importScripts("lib/util.js","lib/algorithm.js","lib/problem.js")}new DoshiWorker}