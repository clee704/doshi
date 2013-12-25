/* global Problem */
'use strict';


describe('problem', function () {

  it('should not throw an exception when there are more classes than courses', function () {
    new Problem({
      courses: ['Math'],
      classes: ['1-1', '1-2'],
      inputTimetable: [[[['1-1', '1-2']]]]
    });
  });

  it('should handle empty classes or courses', function () {
    new Problem({
      courses: ['Math'],
      classes: ['1-1'],
      inputTimetable: [[[[]]]]
    });
    new Problem({
      courses: ['Math'],
      classes: ['1-1'],
      inputTimetable: [[[['1-1'], []]]]
    });
  });

  it('should throw an exception when there are not enough number of courses', function () {
    expect(function () {
      new Problem({
        courses: ['Math'],
        classes: ['1-1', '1-2', '1-3'],
        inputTimetable: [[[['1-1', '1-2', '1-3']]]],
        maxClasses: 2
      });
    }).toThrow();
  });
});
