/* exported swap, range, map_obj, obj_values, obj_map, zip, set_partitions,
            sort_partitions, permutations, square, sum, variance, randint,
            shuffle, is_deep_empty */
'use strict';


function swap(array, i, j) {
  var temp = array[i];
  array[i] = array[j];
  array[j] = temp;
}


function range(start_or_stop, stop, step) {
  var start = 0;
  if (stop === undefined) {
    stop = start_or_stop;
  } else {
    start = start_or_stop;
  }
  if (step === undefined) step = 1;
  if (step === 0) throw new RangeError('range() step argument must not be zero');
  var ret = [];
  var i;
  if (start < stop) {
    if (step > 0) {
      for (i = start; i < stop; i += step) ret.push(i);
    }
  } else {
    if (step < 0) {
      for (i = start; i > stop; i += step) ret.push(i);
    }
  }
  return ret;
}


function map_obj(array, func) {
  var obj = {};
  for (var i = 0; i < array.length; i++) {
    var key = array[i];
    var value = func.call(undefined, key, i);
    obj[key] = value;
  }
  return obj;
}


function obj_values(obj) {
  var ret = [];
  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    ret.push(obj[key]);
  }
  return ret;
}


function obj_map(obj, func) {
  var ret = [];
  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    ret.push(func.call(obj, key));
  }
  return ret;
}


function zip(array1, array2) {
  var ret = [];
  var n = Math.min(array1.length, array2.length);
  for (var i = 0; i < n; i++) {
    ret.push([array1[i], array2[i]]);
  }
  return ret;
}


function set_partitions(set, maximum_subset_size) {
  var partitions = _set_partitions(set);
  if (maximum_subset_size !== undefined) {
    partitions = partitions.filter(function (partition) {
      for (var i = 0; i < partition.length; i++) {
        if (partition[i].length > maximum_subset_size) return false;
      }
      return true;
    });
  }
  return partitions;
}


function _set_partitions(set) {
  if (set.length === 1) {
    return [[set]];
  } else {
    var set_copy = set.slice();
    var head = set_copy.splice(-1);
    var tail = set_copy;
    var partitions = _set_partitions(tail);
    var ret = [];
    for (var i = 0; i < partitions.length; i++) {
      var partition = partitions[i];
      for (var j = 0; j < partition.length; j++) {
        var partition_copy = partition.slice();
        var subset = partition_copy.splice(j, 1)[0];
        var others = partition_copy;
        ret.push(others.concat([subset.concat(head)]));
      }
      ret.push(partition.concat([head]));
    }
    return ret;
  }
}


function sort_partitions(partitions) {
  for (var i = 0; i < partitions.length; i++) {
    var partition = partitions[i];
    partition.sort(_compare_subsets);
  }
  partitions.sort(_compare_partitions);
  return partitions;
}


function _compare_subsets(s1, s2) {
  var d = s1.length - s2.length;
  if (d) return d;
  if (s1 < s2) return -1;
  else if (s1 > s2) return 1;
  return 0;
}


function _compare_partitions(p1, p2) {
  var d = p1.length - p2.length;
  if (d) return -d;
  for (var i = 0; i < p1.length; i++) {
    d = _compare_subsets(p1[i], p2[i]);
    if (d) return d;
  }
  return 0;
}


function permutations(array, size) {
  // Ported Python code found at http://docs.python.org/2/library/itertools.html#itertools.permutations
  var ret = [];
  var n = array.length;
  if (size === undefined) size = n;
  if (size > n) return ret;
  var indices = range(n);
  var cycles = range(n, n - size, -1);
  var itemgetter = function (index) { return array[index]; };
  ret.push(indices.slice(0, size).map(itemgetter));
  var stop = false;
  while (!stop) {
    stop = true;
    for (var i = size - 1; i >= 0; i--) {
      cycles[i] -= 1;
      if (cycles[i] === 0) {
        var index_at_i = indices.splice(i, 1);
        indices.push(index_at_i);
        cycles[i] = n - i;
      } else {
        var j = cycles[i];
        swap(indices, i, n - j);
        ret.push(indices.slice(0, size).map(itemgetter));
        stop = false;
        break;
      }
    }
  }
  return ret;
}


function square(n) {
  return n * n;
}


function sum(numbers) {
  var ret = 0;
  for (var i = 0; i < numbers.length; i++) {
    ret += numbers[i];
  }
  return ret;
}


function variance(numbers) {
  var n = numbers.length;
  return sum(numbers.map(square)) / n - square(sum(numbers) / n);
}


function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}


function shuffle(array) {
  // Knuth shuffle
  for (var i = array.length - 1; i >= 1; i--) {
    var j = randint(0, i);
    swap(array, i, j);
  }
  // Naïve shuffle (for comparison)
  // for (var i = 0; i < array.length; i++) {
  //   var j = randint(0, array.length - 1);
  //   swap(array, i, j);
  // }
}


function is_deep_empty(array) {
  for (var i = 0; i < array.length; i++) {
    var element = array[i];
    if (element instanceof Array) {
      if (!is_deep_empty(element)) {
        return false;
      } else {
        continue;
      }
    } else if (element) {
      return false;
    }
  }
  return true;
}
