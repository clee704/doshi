/* global swap, range, map_obj, obj_values, obj_map, zip, set_partitions,
          sort_partitions, permutations, square, sum, variance, randint,
          shuffle, is_deep_empty */
'use strict';


describe('util', function () {

  describe('swap', function () {
    it('should swap elements', function () {
      var a = ['a', 'b', 'c'];
      swap(a, 0, 1);
      expect(a).toEqual(['b', 'a', 'c']);
      swap(a, 1, 1);
      expect(a).toEqual(['b', 'a', 'c']);
    });
  });

  describe('range', function () {
    it('should return a list of numbers from 0 to stop - 1', function () {
      expect(range(1)).toEqual([0]);
      expect(range(5)).toEqual([0, 1, 2, 3, 4]);
      expect(range(0)).toEqual([]);
    });
    it('should return a list of numbers from start to stop - 1', function () {
      expect(range(5, 3)).toEqual([]);
      expect(range(5, 10)).toEqual([5, 6, 7, 8, 9]);
    });
    it('should return a list of numbers from start to stop - 1, increasing by step', function () {
      expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
      expect(range(2, -2, -1)).toEqual([2, 1, 0, -1]);
    });
  });

  describe('map_obj', function () {
    it('should return an object that maps each element in array to the return value of func', function () {
      expect(map_obj(['dog', 'cat', 'penguin'], function () { return 0; })).toEqual({
        dog: 0,
        cat: 0,
        penguin: 0
      });
    });
    it('should pass each element and its index to func', function () {
      expect(map_obj(['dog', 'cat', 'penguin'], function (animal, index) {
        return animal + ' is at ' + index;
      })).toEqual({
        dog: 'dog is at 0',
        cat: 'cat is at 1',
        penguin: 'penguin is at 2'
      });
    });
    it('should return an empty object when array is empty', function () {
      expect(map_obj([], function () { return 0; })).toEqual([]);
    });
  });

  describe('obj_values', function () {
    it('should return the property values of an object', function () {
      expect(obj_values({a: 2, b: 3, c: 4}).sort()).toEqual([2, 3, 4]);
    });
  });

  describe('obj_map', function () {
    it('should return an array that maps each property of an object to the return value of func', function () {
      var obj = {a: 1, b: 2, c: 3};
      expect(obj_map(obj, function (key) { return key; }).sort()).toEqual(['a', 'b', 'c']);
    });
  });

  describe('zip', function () {
    it('should return an array of pairs', function () {
      expect(zip([1, 2, 3], ['a', 'b', 'c'])).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
    });
    it('should ignore extra elements in a larger array', function () {
      expect(zip([1, 2, 3], ['a', 'b'])).toEqual([[1, 'a'], [2, 'b']]);
      expect(zip([], ['a', 'b'])).toEqual([]);
    });
  });

  describe('set_partitions', function () {
    it('should partition elements into subsets in every possible way', function () {
      expect(set_partitions([1])).toEqual([[[1]]]);
      expect(sort_partitions(set_partitions([1, 2]))).toEqual([[[1], [2]], [[1, 2]]]);
      expect(sort_partitions(set_partitions([1, 2, 3]))).toEqual([
        [[1], [2], [3]],
        [[1], [2, 3]],
        [[2], [1, 3]],
        [[3], [1, 2]],
        [[1, 2, 3]]
      ]);
      expect(sort_partitions(set_partitions([1, 2, 3, 4]))).toEqual([
        [[1], [2], [3], [4]],
        [[1], [2], [3, 4]],
        [[1], [3], [2, 4]],
        [[1], [4], [2, 3]],
        [[2], [3], [1, 4]],
        [[2], [4], [1, 3]],
        [[3], [4], [1, 2]],
        [[1], [2, 3, 4]],
        [[2], [1, 3, 4]],
        [[3], [1, 2, 4]],
        [[4], [1, 2, 3]],
        [[1, 2], [3, 4]],
        [[1, 3], [2, 4]],
        [[1, 4], [2, 3]],
        [[1, 2, 3, 4]]
      ]);
    });
    it('should filter partitions with large subsets', function () {
      expect(sort_partitions(set_partitions([1, 2, 3, 4], 2))).toEqual([
        [[1], [2], [3], [4]],
        [[1], [2], [3, 4]],
        [[1], [3], [2, 4]],
        [[1], [4], [2, 3]],
        [[2], [3], [1, 4]],
        [[2], [4], [1, 3]],
        [[3], [4], [1, 2]],
        [[1, 2], [3, 4]],
        [[1, 3], [2, 4]],
        [[1, 4], [2, 3]]
      ]);
    });
  });

  describe('permutations', function () {
    it('should return every possible permutations', function () {
      expect(permutations([1, 2, 3])).toEqual([
        [1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]
      ]);
      expect(permutations([1, 2, 3], 2)).toEqual([
        [1, 2], [1, 3], [2, 1], [2, 3], [3, 1], [3, 2]
      ]);
    });
    it('should return an empty list if size > array.length', function () {
      expect(permutations([1, 2], 3)).toEqual([]);
    });
  });

  describe('square', function () {
    it('should compute the square', function () {
      expect(square(0)).toBe(0);
      expect(square(2)).toBe(4);
      expect(square(-3)).toBe(9);
    });
  });

  describe('sum', function () {
    it('should compute the sum of numbers', function () {
      expect(sum([])).toBe(0);
      expect(sum([-1])).toBe(-1);
      expect(sum([1, 2, 3, 4, 5])).toBe(15);
    });
  });

  describe('variance', function () {
    it('should compute the variance of numbers', function () {
      expect(variance([1])).toBe(0);
      expect(variance([5, -5, 0, 10, 15])).toBe(50);
      expect(variance([600, 470, 170, 430, 300])).toBe(21704);
    });
  });

  describe('randint', function () {
    it('should return numbers between a and b inclusive', function () {
      for (var i = 0; i < 1000; i++) {
        var n = randint(1, 10);
        expect(n).toBeGreaterThan(0);
        expect(n).toBeLessThan(11);
        if (n < 1 || n > 10) break;
      }
    });
  });

  describe('shuffle', function () {
    it('should shuffle elements evenly', function () {
      var counter = [0, 0, 0, 0, 0, 0];
      for (var i = 0; i < 600000; i++) {
        var array = [1, 2, 3];
        shuffle(array);
        var a = array[0];
        var b = array[1];
        var c = array[2];
        if (a === 1 && b === 2 && c === 3) counter[0] += 1;
        else if (a === 1 && b === 3 && c === 2) counter[1] += 1;
        else if (a === 2 && b === 1 && c === 3) counter[2] += 1;
        else if (a === 2 && b === 3 && c === 1) counter[3] += 1;
        else if (a === 3 && b === 1 && c === 2) counter[4] += 1;
        else if (a === 3 && b === 2 && c === 1) counter[5] += 1;
      }
      var std = Math.sqrt(variance(counter));
      // console.log(counter, std);
      expect(std).toBeLessThan(1000, 'Don\'t panic! In a very rare case, it could fail. If you see this message often, however, it could mean your shuffle algorithm is broken.');
    });
  });

  describe('is_deep_empty', function () {
    it('should return true for nested empty arrays', function () {
      expect(is_deep_empty([])).toBeTruthy();
      expect(is_deep_empty([[]])).toBeTruthy();
      expect(is_deep_empty([[], [[], []]])).toBeTruthy();
    });
    it('should return false for non nested empty arrays', function () {
      expect(is_deep_empty([1])).toBeFalsy();
      expect(is_deep_empty([[1]])).toBeFalsy();
      expect(is_deep_empty([[], [[], [1]]])).toBeFalsy();
      expect(is_deep_empty(['1'])).toBeFalsy();
    });
  });

});
