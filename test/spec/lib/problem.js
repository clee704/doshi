/* global Problem */
'use strict';


describe('problem', function () {

  it('should not throw an exception when there are more classes than courses', function () {
    new Problem(['Math'], ['1-1', '1-2'], [[[['1-1', '1-2']]]]);
  });

  it('should handle empty classes or courses', function () {
    new Problem(['Math'], ['1-1'], [[[[]]]]);
    new Problem(['Math'], ['1-1'], [[[['1-1'], []]]]);
  });

  it('should throw an exception when there are not enough number of courses', function () {
    expect(function () {
      new Problem(['Math'], ['1-1', '1-2', '1-3'], [[[['1-1', '1-2', '1-3']]]], 2);
    }).toThrow();
  });
});
