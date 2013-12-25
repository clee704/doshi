/* global map_obj, obj_map, obj_values, permutations, randint, set_partitions,
          shuffle, square, sum, variance, zip */
/* exported Problem */
'use strict';


function Problem(args) {
  // Input
  this.courses = args.courses;                  // Math, History, Science, ...
  this.classes = args.classes;                  // 1-1, 2-7, 3-4, ...
  this.days = [0, 1, 2, 3, 4];                  // Monday to Friday
  this.input_timetable = args.input_timetable;  // Which class should be given a course when
  this.maximum_classes = args.maximum_classes || this.classes.length;
                                                // Maximum number of classes for a course at a time
  this.course_hours = args.course_hours;        // Target hours for courses

  // Output
  this.timetable = [];

  // Make auxiliary variables
  this._make_available_times();
  this._make_time_allocs();

  // Make a random timetable to start with
  this.init_random();
}

Problem.prototype._make_available_times = function () {
  var available_times = [];
  for (var c = 0; c < this.input_timetable.length; c++) {
    var column = this.input_timetable[c];
    for (var r = 0; r < column.length; r++) {
      var available_info = column[r];
      if (available_info && available_info[0] && available_info[0].length) {
        available_times.push([c, r].concat(available_info));
      }
    }
  }
  this._available_times = available_times;
};

Problem.prototype._make_time_allocs = function () {
  var time_allocs = [];
  var num_periods = 0;
  for (var i = 0; i < this._available_times.length; i++) {
    var time_info = this._available_times[i];
    var period = time_info[1];
    if (period + 1 > num_periods) {
      num_periods = period + 1;
    }
    var available_classes = time_info[2];
    var available_courses = time_info[3];
    if (!available_courses || available_courses.length === 0) {
      available_courses = this.courses;
    }
    var temp = [];
    var class_partitions = set_partitions(available_classes, this.maximum_classes);
    for (var j = 0; j < class_partitions.length; j++) {
      var classes = class_partitions[j];
      if (available_courses.length < classes.length) {
        continue;
      }
      var course_permutations = permutations(available_courses, classes.length);
      for (var k = 0; k < course_permutations.length; k++) {
        var courses = course_permutations[k];
        var temp2 = [];
        var arrangements = zip(courses, classes);
        for (var l = 0; l < arrangements.length; l++) {
          temp2.push(arrangements[l]);
        }
        temp.push(temp2);
      }
    }
    time_allocs.push(temp);
  }
  this._time_allocs = time_allocs;
  this._num_periods = num_periods;
};

Problem.prototype.init_random = function () {
  var problem = this;

  // Initialize counters that is used to evaluate the fitness of the current timetable
  var zero = function () { return 0; };
  this._c = {
    courses: map_obj(this.courses, zero),
    courses_by_day: map_obj(this.days, function () { return map_obj(problem.courses, zero); }),
    courses_by_class: map_obj(this.classes, function () { return map_obj(problem.courses, zero); }),
    days_by_course: map_obj(this.courses, function () { return map_obj(problem.days, zero); }),
    classes_by_course: map_obj(this.courses, function () { return map_obj(problem.classes, zero); })
  };

  // Make a new timetable and fill it randomly
  this.timetable = [];
  this.timetable.length = this._available_times.length;
  for (var time_index = 0; time_index < this._available_times.length; time_index++) {
    var alloc_index = randint(0, this._time_allocs[time_index].length - 1);
    this._set_slot(time_index, alloc_index);
  }
  this._history = [];
};

Problem.prototype._set_slot = function (time_index, alloc_index) {
  var c = this._c;
  var day = this._available_times[time_index][0];
  var alloc = this._time_allocs[time_index][alloc_index];
  if (alloc === undefined) {
    throw new Error('The problem is unsolvable');
  }
  for (var i = 0; i < alloc.length; i++) {
    var course = alloc[i][0];
    var class_set = alloc[i][1];
    // Update counters
    c.courses[course] += 1;
    c.courses_by_day[day][course] += 1;
    c.days_by_course[course][day] += 1;
    for (var j = 0; j < class_set.length; j++) {
      var klass = class_set[j];
      c.courses_by_class[klass][course] += 1;
      c.classes_by_course[course][klass] += 1;
    }
  }
  this.timetable[time_index] = alloc_index;
};

Problem.prototype._unset_slot = function (time_index) {
  var c = this._c;
  var alloc_index = this.timetable[time_index];
  var day = this._available_times[time_index][0];
  var alloc = this._time_allocs[time_index][alloc_index];
  for (var i = 0; i < alloc.length; i++) {
    var course = alloc[i][0];
    var class_set = alloc[i][1];
    // Update counters
    c.courses[course] -= 1;
    c.courses_by_day[day][course] -= 1;
    c.days_by_course[course][day] -= 1;
    for (var j = 0; j < class_set.length; j++) {
      var klass = class_set[j];
      c.courses_by_class[klass][course] -= 1;
      c.classes_by_course[course][klass] -= 1;
    }
  }
  this.timetable[time_index] = undefined;
};

Problem.prototype.evaluate = function () {
  var self = this;
  var c = this._c;

  var course_hours = obj_values(c.courses);

  // Compute variance of course hours
  var var_course_hours;
  if (this.course_hours === undefined) {
    var_course_hours = variance(course_hours);
  } else if (typeof this.course_hours === 'object') {
    var_course_hours = sum(obj_map(this.course_hours, function (course) {
      return square(c.courses[course] - self.course_hours[course]);
    }));
  } else {
    var_course_hours = sum(this.courses.map(function (course) {
      return square(c.courses[course] - self.course_hours);
    }));
  }

  // Compute sums of variances
  // var sum_var_courses_by_day = sum_of_variances(c.courses_by_day);
  var sum_var_courses_by_class = sum_of_variances(c.courses_by_class);
  var sum_var_days_by_course = sum_of_variances(c.days_by_course);
  // var sum_var_classes_by_course = sum_of_variances(c.classes_by_course);

  return [
    var_course_hours,
    sum_var_courses_by_class,
    sum_var_days_by_course,
    sum(course_hours)
  ];
};

Problem.prototype.compare_fitness = function (a, b) {
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

Problem.prototype.moves = function (do_shuffle) {
  var moves = [];
  for (var time_index = 0; time_index < this._available_times.length; time_index++) {
    for (var alloc_index = 0; alloc_index < this._time_allocs[time_index].length; alloc_index++) {
      moves.push([time_index, alloc_index]);
    }
  }
  if (do_shuffle) {
    shuffle(moves);
  }
  return moves;
};

Problem.prototype.move = function (move) {
  var time_index = move[0];
  var alloc_index = move[1];
  this._history.push([time_index, this.timetable[time_index]]);
  this._unset_slot(time_index);
  this._set_slot(time_index, alloc_index);
};

Problem.prototype.undo = function () {
  var move = this._history.pop();
  var time_index = move[0];
  var alloc_index = move[1];
  this._unset_slot(time_index);
  this._set_slot(time_index, alloc_index);
};

Problem.prototype.convert_timetable = function (timetable) {
  var ret = [];
  for (var c = 0; c < this.days.length; c++) {
    var column = [];
    column.length = this._num_periods;
    ret.push(column);
  }
  for (var i = 0; i < this._available_times.length; i++) {
    var time_info = this._available_times[i];
    var day = time_info[0];
    var period = time_info[1];
    var alloc = this._time_allocs[i][timetable[i]];
    ret[day][period] = alloc;
  }
  return ret;
};


function sum_of_variances(nested_obj) {
  return sum(obj_map(nested_obj, function (key) {
    return variance(obj_values(nested_obj[key]));
  }));
}
