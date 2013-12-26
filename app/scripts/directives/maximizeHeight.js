'use strict';

angular.module('doshi')

  // Maximizes the height of elements so that they fill their parents vertically.
  .directive('maximizeHeight', function ($window, $timeout, debounce) {

    // Register the resize handler to window. This code is run only once.
    var handlers = {};
    angular.element($window).on('resize', debounce(function () {
      for (var name in handlers) {
        if (!handlers.hasOwnProperty(name)) continue;
        handlers[name]();
      }
    }, 400));

    return {
      link: function (scope, element, attr) {
        function maximizeHeight() {
          // Revert the changes.
          if (element.hasClass('height-maximized')) {
            element.css('height', '').removeClass('height-maximized');
          }
          $timeout(function () {
            if (attr.resizeIf && !scope.$eval(attr.resizeIf)) return;
            var height = element.height();
            // +1 is needed for highlights in output timetable to be fully filled.
            var parentHeight = element.parent().height() + 1;
            if (height === parentHeight) return;
            element.css('height', parentHeight + 'px').addClass('height-maximized');
          });
        }
        handlers[scope.$id] = maximizeHeight;
        scope.$on('$destroy', function () { delete handlers[scope.$id]; });
        scope.$watch(attr.watch, maximizeHeight, true);
      }
    };
  });
