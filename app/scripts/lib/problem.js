/* global mapObj, objMap, objValues, permutations, randint, setPartitions,
          shuffle, square, sum, variance, zip */
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

Problem.prototype._makeTimeAllocs = function () {
  var timeAllocs = [];
  var numPeriods = 0;
  for (var i = 0; i < this._availableTimes.length; i++) {
    var timeInfo = this._availableTimes[i];
    var period = timeInfo[1];
    if (period + 1 > numPeriods) {
      numPeriods = period + 1;
    }
    var availableClasses = timeInfo[2];
    var availableCourses = timeInfo[3];
    if (!availableCourses || availableCourses.length === 0) {
      availableCourses = this.courses;
    }
    var temp = [];
    var classPartitions = setPartitions(availableClasses, this.maxClasses);
    for (var j = 0; j < classPartitions.length; j++) {
      var classes = classPartitions[j];
      if (availableCourses.length < classes.length) {
        continue;
      }
      var coursePermutations = permutations(availableCourses, classes.length);
      for (var k = 0; k < coursePermutations.length; k++) {
        var courses = coursePermutations[k];
        var temp2 = [];
        var arrangements = zip(courses, classes);
        for (var l = 0; l < arrangements.length; l++) {
          temp2.push(arrangements[l]);
        }
        temp.push(temp2);
      }
    }
    timeAllocs.push(temp);
  }
  this._timeAllocs = timeAllocs;
  this._numPeriods = numPeriods;
};

Problem.prototype.initRandom = function () {
  var problem = this;

  // Initialize counters that is used to evaluate the fitness of the current timetable
  var zero = function () { return 0; };
  this._c = {
    courses: mapObj(this.courses, zero),
    coursesByDay: mapObj(this.days, function () { return mapObj(problem.courses, zero); }),
    coursesByClass: mapObj(this.classes, function () { return mapObj(problem.courses, zero); }),
    daysByCourse: mapObj(this.courses, function () { return mapObj(problem.days, zero); }),
    classesByCourse: mapObj(this.courses, function () { return mapObj(problem.classes, zero); })
  };

  // Make a new timetable and fill it randomly
  this.timetable = [];
  this.timetable.length = this._availableTimes.length;
  for (var timeIndex = 0; timeIndex < this._availableTimes.length; timeIndex++) {
    var allocIndex = randint(0, this._timeAllocs[timeIndex].length - 1);
    this._setSlot(timeIndex, allocIndex);
  }
  this._history = [];
};

Problem.prototype._setSlot = function (timeIndex, allocIndex) {
  var c = this._c;
  var day = this._availableTimes[timeIndex][0];
  var alloc = this._timeAllocs[timeIndex][allocIndex];
  if (alloc === undefined) {
    throw new Error('The problem is unsolvable');
  }
  for (var i = 0; i < alloc.length; i++) {
    var course = alloc[i][0];
    var classSet = alloc[i][1];
    // Update counters
    c.courses[course] += 1;
    c.coursesByDay[day][course] += 1;
    c.daysByCourse[course][day] += 1;
    for (var j = 0; j < classSet.length; j++) {
      var klass = classSet[j];
      c.coursesByClass[klass][course] += 1;
      c.classesByCourse[course][klass] += 1;
    }
  }
  this.timetable[timeIndex] = allocIndex;
};

Problem.prototype._unsetSlot = function (timeIndex) {
  var c = this._c;
  var allocIndex = this.timetable[timeIndex];
  var day = this._availableTimes[timeIndex][0];
  var alloc = this._timeAllocs[timeIndex][allocIndex];
  for (var i = 0; i < alloc.length; i++) {
    var course = alloc[i][0];
    var classSet = alloc[i][1];
    // Update counters
    c.courses[course] -= 1;
    c.coursesByDay[day][course] -= 1;
    c.daysByCourse[course][day] -= 1;
    for (var j = 0; j < classSet.length; j++) {
      var klass = classSet[j];
      c.coursesByClass[klass][course] -= 1;
      c.classesByCourse[course][klass] -= 1;
    }
  }
  this.timetable[timeIndex] = undefined;
};

Problem.prototype.evaluate = function () {
  var self = this;
  var c = this._c;

  var courseHours = objValues(c.courses);

  // Compute variance of course hours
  var varCourseHours;
  if (this.courseHours === undefined) {
    varCourseHours = variance(courseHours);
  } else if (typeof this.courseHours === 'object') {
    varCourseHours = sum(objMap(this.courseHours, function (course) {
      return square(c.courses[course] - self.courseHours[course]);
    }));
  } else {
    varCourseHours = sum(this.courses.map(function (course) {
      return square(c.courses[course] - self.courseHours);
    }));
  }

  // Compute sums of variances
  // var sum_var_courses_by_day = sumOfVariances(c.coursesByDay);
  var sumVarCoursesByClass = sumOfVariances(c.coursesByClass);
  var sumVarDaysByCourse = sumOfVariances(c.daysByCourse);
  // var sum_var_classes_by_course = sumOfVariances(c.classesByCourse);

  return [
    varCourseHours,
    sumVarCoursesByClass,
    sumVarDaysByCourse,
    sum(courseHours)
  ];
};

Problem.prototype.compareFitness = function (a, b) {
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

Problem.prototype.moves = function (doShuffle) {
  var moves = [];
  for (var timeIndex = 0; timeIndex < this._availableTimes.length; timeIndex++) {
    for (var allocIndex = 0; allocIndex < this._timeAllocs[timeIndex].length; allocIndex++) {
      moves.push([timeIndex, allocIndex]);
    }
  }
  if (doShuffle) {
    shuffle(moves);
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

Problem.prototype.convertTimetable = function (timetable) {
  var ret = [];
  for (var c = 0; c < this.days.length; c++) {
    var column = [];
    column.length = this._numPeriods;
    ret.push(column);
  }
  for (var i = 0; i < this._availableTimes.length; i++) {
    var timeInfo = this._availableTimes[i];
    var day = timeInfo[0];
    var period = timeInfo[1];
    var alloc = this._timeAllocs[i][timetable[i]];
    ret[day][period] = alloc;
  }
  return ret;
};


function sumOfVariances(nestedObj) {
  return sum(objMap(nestedObj, function (key) {
    return variance(objValues(nestedObj[key]));
  }));
}
