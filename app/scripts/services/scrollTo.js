'use strict';

angular.module('doshi')

  // Scrolls the main window so that the element given by the specified selector
  // is shown.
  .factory('scrollTo', function () {
    return function (selector, options) {
      if (options === undefined) options = {};
      var element = angular.element(selector);
      var scrollpane = angular.element('body');
      var target = element.offset().top - 15;
      var current = scrollpane.scrollTop();
      if (options.direction === 'upward' && target > current) return;
      scrollpane.animate({scrollTop: target}, 'fast');
    };
  });
