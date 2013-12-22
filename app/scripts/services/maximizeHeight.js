'use strict';

angular.module('timetableJsApp')

  // Maximizes the height of elements with attribute `maximize-height` so that
  // they fill their parents vertically. If transition is true, apply 400ms
  // CSS transition. If predicateFn is provided, an angular.element wrapped
  // element is passed to the function and only elements for which the function
  // returns a truthy value is changed.
  .factory('maximizeHeight', function () {
    return function (transition, predicateFn) {
      angular.element('[maximize-height]').each(function () {
        var $this = angular.element(this);
        if (predicateFn && !predicateFn($this)) return;
        var height = $this.height();
        var parentHeight = $this.parent().height();
        if (height === parentHeight) return;
        $this.css('height', height + 'px');
        if (transition) {
          $this.css('transition', '.4s height');
        }
        $this.parent().height();  // Strangely, this call is necessary for transition to work.
        $this.css('height', parentHeight + 'px').addClass('height-maximized');
      });
    };
  })

  // Reverts the changes made by maximizeHeight.
  .factory('unmaximizeHeight', function () {
    return function () {
      angular.element('.height-maximized').css({
        height: '',
        transition: ''
      }).removeClass('height-maximized');
    };
  })

  // Turns on or off the handler that keeps the maximization up to date when
  // window is resized.
  .factory('maintainMaximizedHeight', function ($window, maximizeHeight, unmaximizeHeight, debounce) {
    var keepHeight = false;
    var handler = debounce(function () {
      unmaximizeHeight();
      maximizeHeight();
    }, 400);
    return function (flag) {
      if (keepHeight === flag) return;
      keepHeight = flag;
      if (keepHeight) {
        angular.element($window).on('resize', handler);
      } else {
        angular.element($window).off('resize', handler);
      }
    };
  });
