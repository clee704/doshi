'use strict';

angular.module('doshi')
  .directive('ngConfirm', function ($window, $parse) {
    return {
      link: function (scope, element, attr) {
        var confirmHandler = $parse(attr.ngConfirm);
        element.on('click', function (event) {
          var confirmed = $window.confirm('입력된 정보를 모두 지우시겠습니까?');
          if (confirmed) {
            scope.$apply(function () {
              confirmHandler(scope, {$event: event});
            });
          }
        });
      }
    };
  });
