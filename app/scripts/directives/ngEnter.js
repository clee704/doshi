'use strict';

angular.module('timetableJsApp')

  // Similar to ngClick, except that it is only triggered by enter key.
  .directive('ngEnter', function ($parse) {
    return {
      link: function (scope, element, attr) {
        var enterHandler = $parse(attr.ngEnter);
        element.on('keypress', function (event) {
          if (event.which === 13 || event.which === 10) {
            scope.$apply(function () {
              enterHandler(scope, {$event: event});
            });
          }
        });
      }
    };
  });
