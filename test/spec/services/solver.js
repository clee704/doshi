'use strict';


describe('solver', function () {

  var solver, problemArgs;

  beforeEach(module('doshi'));
  beforeEach(inject(function (_problemArgs_, Solver) {
    problemArgs = _problemArgs_;
    problemArgs.courses = ['Math', 'Science'];
    solver = new Solver();
  }));

  describe('_getCourseHours', function () {
    it('should return courseHours if defined', function () {
      problemArgs.courseHours = 1;
      expect(solver._getCourseHours()).toEqual(1);
    });
    it('should return courseHoursByCourse if defined', function () {
      problemArgs.courseHoursByCourse.Math = 5;
      problemArgs.courseHoursByCourse.Science = 6;
      expect(solver._getCourseHours()).toEqual({
        Math: 5,
        Science: 6
      });
    });
    it('should return courseHoursByCourse if defined even if courseHours is defined', function () {
      problemArgs.courseHours = 1;
      problemArgs.courseHoursByCourse.Math = 2;
      problemArgs.courseHoursByCourse.Science = 3;
      expect(solver._getCourseHours()).toEqual({
        Math: 2,
        Science: 3
      });
    });
    it('should fill missing values with courseHours', function () {
      problemArgs.courseHours = 5;
      problemArgs.courseHoursByCourse.Math = 3;
      expect(solver._getCourseHours()).toEqual({
        Math: 3,
        Science: 5
      });
    });
    it('should fill missing values with the average of existing values', function () {
      problemArgs.courses = ['Math', 'Science', 'Korean'];
      problemArgs.courseHoursByCourse.Math = 5;
      problemArgs.courseHoursByCourse.Korean = 7;
      expect(solver._getCourseHours()).toEqual({
        Math: 5,
        Science: 6,
        Korean: 7
      });
    });
  });

});
