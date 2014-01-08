'use strict';


describe('random', function () {

  var random, p;

  beforeEach(module('doshi'));
  beforeEach(inject(function (_random_) {
    random = _random_;
    random.uniform = function () {
      return p;
    };
  }));

  describe('choice', function () {
    it('should return a correct item according to the probability', function () {
      p = 0.1;
      expect(random.choice(['a', 'b'], [0.2, 0.8])).toEqual('a');
      p = 0.91;
      expect(random.choice(['a', 'b', 'c', 'd'], [0.8, 0.05, 0.05, 0.1])).toEqual('d');
    });
  });
});
