'use strict';

angular.module('doshi')

  // Removes ugly outline around button or link in FF and IE
  // when it is clicked by mouse.
  .directive('removeOutline', function () {
    return {
      link: function (scope, element/*, attr */) {
        element.on('click', function (event) {
          if (event.clientX > 0 && event.clientY > 0) {
            // Clicked by mouse.
            element.blur();
          }
        });
      }
    };
  });
