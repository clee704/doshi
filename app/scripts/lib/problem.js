/* global mapObj, objMap, objValues, permutations, randint, setPartitions,
          square, sum, variance, zip */
/* exported Problem */
'use strict';


function Problem(args) {
  // Input
  this.courses = args.courses;                // Math, History, Science, ...
  this.classes = args.classes;                // 1-1, 2-7, 3-4, ...
  this.days = [0, 1, 2, 3, 4];                // Monday to Friday
  this.inputTimetable = args.inputTimetable;  // Which class should be given a course when
  this.maxClasses = args.maxClasses || this.classes.length;
                                              // Maximum number of classes for a course at a time
  this.courseHours = args.courseHours;        // Target hours for courses

  // Output
  this.timetable = [];

  // Make auxiliary variables
  this._makeAvailableTimes();
  this._makeTimeAllocs();

  // Make a random timetable to start with
  this.initRandom();
}

// Converts the given input timetable into an internal representation
// which is more suited for searching.
Problem.prototype._makeAvailableTimes = function () {
  var availableTimes = [];
  for (var c = 0; c < this.inputTimetable.length; c++) {
    var column = this.inputTimetable[c];
    for (var r = 0; r < column.length; r++) {
      var availableInfo = column[r];
      if (availableInfo && availableInfo[0] && availableInfo[0].length) {
        availableTimes.push([c, r].concat(availableInfo));
      }
    }
  }
  this._availableTimes = availableTimes;
};

// Makes all possible combinations of courses and classes for each time period.
Problem.prototype._makeTimeAllocs = function () {
  var timeAllocs = [];
  var numPeriods = 0;
  for (var timeIndex = 0; timeIndex < this._availableTimes.length; timeIndex++) {
    var timeInfo = this._availableTimes[timeIndex];
    var period = timeInfo[1];
    if (period + 1 > numPeriods) {
      // Update the number of periods for future use.
      numPeriods = period + 1;
    }
    var availableClasses = timeInfo[2];
    var availableCourses = timeInfo[3];
    if (!availableCourses || availableCourses.length === 0) {
      // Empty courses mean any course.
      availableCourses = this.courses;
    }
    var allocs = [];
    var classPartitions = setPartitions(availableClasses, this.maxClasses);
    for (var j = 0; j < classPartitions.length; j++) {
      var classGroups = classPartitions[j];
      if (availableCourses.length < classGroups.length) {
        // We cannot assign n courses to m groups of classes where n < m.
        continue;
      }
      var coursePermutations = permutations(availableCourses, classGroups.length);
      for (var k = 0; k < coursePermutations.length; k++) {
        var courses = coursePermutations[k];
        var arrangements = zip(courses, classGroups);
        allocs.push(arrangements);
      }
    }
    timeAllocs.push(allocs);
  }
  this._timeAllocs = timeAllocs;
  this._numPeriods = numPeriods;
};

Problem.prototype.initRandom = function () {
  var problem = this;

  // Variables for fitness evaluation.
  var zero = function () { return 0; };
  var dayCounters = function () { return mapObj(problem.days, zero); };
  var courseCounters = function () { return mapObj(problem.courses, zero); };
  this._c = {
    // Number of hours for each course.
    courses: courseCounters(),
    varCourses: 0,
    sumCourses: 0,

    // Number of hours for each course for each class.
    coursesByClass: mapObj(this.classes, courseCounters),
    sumVarCoursesByClass: 0,
    sumCoursesByClass: mapObj(this.classes, zero),

    // Number of hours for each day for each course.
    daysByCourse: mapObj(this.courses, dayCounters),
    sumVarDaysByCourse: 0,
    sumDaysByCourse: courseCounters(),

    // Number of hours for each course for each day for each class.
    coursesByDayByClass: mapObj(this.classes, function () {
      return mapObj(problem.days, courseCounters);
    }),
    sumVarCoursesByDayByClass: 0,
    sumCoursesByDayByClass: mapObj(this.classes, dayCounters)
  };
  this._c.varCourses = this._computeVarCourses();

  // Make a new timetable and fill it randomly.
  this.timetable = [];
  this.timetable.length = this._availableTimes.length;
  for (var timeIndex = 0; timeIndex < this._availableTimes.length; timeIndex++) {
    var allocIndex = randint(0, this._timeAllocs[timeIndex].length - 1);
    this._setSlot(timeIndex, allocIndex);
  }
  this._history = [];
};

Problem.prototype._setSlot = function (timeIndex, allocIndex) {
  var day = this._availableTimes[timeIndex][0];
  var alloc = this._timeAllocs[timeIndex][allocIndex];
  if (alloc === undefined) {
    throw new Error('The problem is unsolvable');
  }
  for (var i = 0; i < alloc.length; i++) {
    var course = alloc[i][0];
    var classGroup = alloc[i][1];
    // Update counters
    this._updateCourses(course, 1);
    this._updateDaysByCourse(course, day, 1);
    for (var j = 0; j < classGroup.length; j++) {
      var klass = classGroup[j];
      this._updateCoursesByClass(klass, course, 1);
      this._updateCoursesByDayByClass(klass, day, course, 1);
    }
  }
  this.timetable[timeIndex] = allocIndex;
};

Problem.prototype._unsetSlot = function (timeIndex) {
  var allocIndex = this.timetable[timeIndex];
  var day = this._availableTimes[timeIndex][0];
  var alloc = this._timeAllocs[timeIndex][allocIndex];
  for (var i = 0; i < alloc.length; i++) {
    var course = alloc[i][0];
    var classGroup = alloc[i][1];
    // Update counters
    this._updateCourses(course, -1);
    this._updateDaysByCourse(course, day, -1);
    for (var j = 0; j < classGroup.length; j++) {
      var klass = classGroup[j];
      this._updateCoursesByClass(klass, course, -1);
      this._updateCoursesByDayByClass(klass, day, course, -1);
    }
  }
  this.timetable[timeIndex] = undefined;
};

Problem.prototype._computeVarCourses = function () {
  var courseHours = this.courseHours;
  var courses = this._c.courses;
  var n = this.courses.length;
  if (!courseHours) {
    return variance(objValues(courses));
  } else if (typeof courseHours === 'object') {
    return sum(objMap(this.courseHours, function (course) {
      return square(courses[course] - courseHours[course]);
    })) / n;
  } else {
    return sum(this.courses.map(function (course) {
      return square(courses[course] - courseHours);
    })) / n;
  }
};

Problem.prototype._updateCourses = function (course, update) {
  var c = this._c;
  var courses = c.courses;
  var oldValue = courses[course];
  var oldSum = c.sumCourses;
  courses[course] += update;
  c.sumCourses += update;

  // Update variance of course hours
  var n = this.courses.length;
  var s = update * 2;
  var t = update * update;
  if (!this.courseHours) {
    c.varCourses += (s * oldValue + t) / n - (s * oldSum + t) / (n * n);
  } else if (typeof this.courseHours === 'object') {
    c.varCourses += (s * (oldValue - this.courseHours[course]) + t) / n;
  } else {
    c.varCourses += (s * (oldValue - this.courseHours) + t) / n;
  }
};

Problem.prototype._updateDaysByCourse = function (course, day, update) {
  var c = this._c;
  var days = c.daysByCourse[course];
  var oldValue = days[day];
  var oldSum = c.sumDaysByCourse[course];
  days[day] += update;
  c.sumDaysByCourse[course] += update;

  // Update sum of variances
  var n = this.days.length;
  var s = update * 2;
  var t = update * update;
  c.sumVarDaysByCourse += (s * oldValue + t) / n - (s * oldSum + t) / (n * n);
};

Problem.prototype._updateCoursesByClass = function (klass, course, update) {
  var c = this._c;
  var courses = c.coursesByClass[klass];
  var oldValue = courses[course];
  var oldSum = c.sumCoursesByClass[klass];
  courses[course] += update;
  c.sumCoursesByClass[klass] += update;

  // Update sum of variances
  var n = this.courses.length;
  var s = update * 2;
  var t = update * update;
  c.sumVarCoursesByClass += (s * oldValue + t) / n - (s * oldSum + t) / (n * n);
};

Problem.prototype._updateCoursesByDayByClass = function (klass, day, course, update) {
  var c = this._c;
  var courses = c.coursesByDayByClass[klass][day];
  var oldValue = courses[course];
  var oldSum = c.sumCoursesByDayByClass[klass][day];
  courses[course] += update;
  c.sumCoursesByDayByClass[klass][day] += update;

  // Update sum of variances
  var n = this.courses.length;
  var s = update * 2;
  var t = update * update;
  c.sumVarCoursesByDayByClass += (s * oldValue + t) / n - (s * oldSum + t) / (n * n);
};

Problem.prototype.evaluate = function () {
  var c = this._c;
  return [
    Math.round(c.varCourses * 1000000) / 1000000,
    Math.round(c.sumVarCoursesByClass * 1000000) / 1000000,
    Math.round(c.sumVarCoursesByDayByClass * 1000000) / 1000000,
    Math.round(c.sumVarDaysByCourse * 1000000) / 1000000,
    c.sumCourses
  ];
};

// Compares two fitness tuples a and b.
Problem.prototype.compareFitness = function (a, b) {
  // We cannot just write it as a < b since it is equivalent to
  // a.toString() < b.toString(), which often gives surprising results.
  var x, y;
  x = a[0];
  y = b[0];
  if (x < y) return -1;
  else if (x > y) return 1;
  x = a[1];
  y = b[1];
  if (x < y) return -1;
  else if (x > y) return 1;
  x = a[2];
  y = b[2];
  if (x < y) return -1;
  else if (x > y) return 1;
  x = a[3];
  y = b[3];
  if (x < y) return -1;
  else if (x > y) return 1;
  return 0;
};

Problem.prototype.moves = function () {
  var moves = [];
  for (var timeIndex = 0; timeIndex < this._availableTimes.length; timeIndex++) {
    for (var allocIndex = 0; allocIndex < this._timeAllocs[timeIndex].length; allocIndex++) {
      moves.push([timeIndex, allocIndex]);
    }
  }
  return moves;
};

Problem.prototype.move = function (move) {
  var timeIndex = move[0];
  var allocIndex = move[1];
  this._history.push([timeIndex, this.timetable[timeIndex]]);
  this._unsetSlot(timeIndex);
  this._setSlot(timeIndex, allocIndex);
};

Problem.prototype.undo = function () {
  var move = this._history.pop();
  var timeIndex = move[0];
  var allocIndex = move[1];
  this._unsetSlot(timeIndex);
  this._setSlot(timeIndex, allocIndex);
};

// Converts the result timetable into a more usable format.
Problem.prototype.convertTimetable = function (timetable) {
  var ret = [];
  var column, day, period, alloc;

  // Make an empty table.
  for (var c = 0; c < this.days.length; c++) {
    column = [];
    column.length = this._numPeriods;
    ret.push(column);
  }

  // Fill the table with allocations.
  for (var i = 0; i < this._availableTimes.length; i++) {
    var timeInfo = this._availableTimes[i];
    day = timeInfo[0];
    period = timeInfo[1];
    alloc = this._timeAllocs[i][timetable[i]];
    ret[day][period] = alloc;
  }

  // Sort arrangements by course indices for each allocation.
  var courseIndices = mapObj(this.courses, function (course, i) {
    return i;
  });
  var compareArrangement = function (a, b) {
    return courseIndices[a[0]] - courseIndices[b[0]];
  };
  for (day = 0; day < ret.length; day++) {
    column = ret[day];
    for (period = 0; period < column.length; period++) {
      alloc = column[period];
      if (!alloc) continue;
      alloc.sort(compareArrangement);
    }
  }
  return ret;
};
