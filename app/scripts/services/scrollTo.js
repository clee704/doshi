'use strict';

angular.module('doshi')

  // Scrolls the main window so that the element given by the specified selector
  // is shown.
  .factory('scrollTo', function () {
    return function (selector) {
      var element = angular.element(selector);
      var top = element.offset().top;
      angular.element('body').animate({scrollTop: top - 15}, 'fast');
    };
  });
