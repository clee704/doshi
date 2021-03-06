/* global mapObj */
'use strict';

angular.module('doshi')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/input-step1.html',
        controller: 'CoursesAndClassesInputCtrl',
        routeName: 'Step 1'
      })
      .when('/input-times', {
        templateUrl: 'views/input-step2.html',
        controller: 'TimesInputCtrl',
        routeName: 'Step 2'
      })
      .when('/input-etc', {
        templateUrl: 'views/input-step3.html',
        controller: 'EtcInputCtrl',
        routeName: 'Step 3'
      })
      .when('/output', {
        templateUrl: 'views/output.html',
        controller: 'OutputCtrl',
        routeName: 'Output'
      })
      .otherwise({
        redirectTo: '/'
      });
  })

  .controller('NavCtrl', function ($scope, $location) {
    $scope.pages = [
      {path: '/', title: '교과목/반 입력'},
      {path: '/input-times', title: '시간 입력'},
      {path: '/input-etc', title: '기타 설정'},
      {path: '/output', title: '시간표 만들기'}
    ];
    $scope.pageTransitionDirection = 'forward';

    var previousPath;
    var pageIndicesByPath = mapObj($scope.pages.map(function (page) { return page.path; }),
                                   function (path, i) { return i; });

    (function linkAdjacentPages() {
      for (var i = 0; i < $scope.pages.length; i++) {
        var page = $scope.pages[i];
        if (i > 0) {
          page.prevPage = $scope.pages[i - 1];
        }
        if (i < $scope.pages.length - 1) {
          page.nextPage = $scope.pages[i + 1];
        }
      }
    })();

    $scope.$on('$locationChangeSuccess', function () {
      // Determine the direction for slide animation.
      var path = $location.path();
      var i = pageIndicesByPath[previousPath];
      var j = pageIndicesByPath[path];
      $scope.pageTransitionDirection = i === undefined || i <= j ? 'forward' : 'backward';

      // Set variables.
      previousPath = path;
      $scope.path = path;
    });

    $scope.getCurrentPage = function () {
      return $scope.pages[pageIndicesByPath[$location.path()]];
    };
  })

  .animation('.view', ['getCssRule', 'scrollTo', function (getCssRule, scrollTo) {
    var selectors = [
      '.forward .view.ng-enter',
      '.forward .view.ng-leave.ng-leave-active',
      '.backward .view.ng-enter',
      '.backward .view.ng-leave.ng-leave-active'
    ];
    var cssRules = selectors.map(getCssRule);
    function updateTranslateAmount(isEnter) {
      return function (element, done) {
        var isForward = element.parent().is('.forward');
        var translateAmount = angular.element('.container').outerWidth();
        var translateText;
        if (isForward && isEnter || !isForward && !isEnter) {
          translateText = 'translate(' + translateAmount + 'px, 0)';
        } else {
          translateText = 'translate(-' + translateAmount + 'px, 0)';
        }
        var index = isForward ? (isEnter ? 0 : 1) : (isEnter ? 2 : 3);
        var cssRule = cssRules[index];
        if (cssRule) {
          cssRule.style['-webkit-transform'] = translateText;
          cssRule.style['-ms-transform'] = translateText;
          cssRule.style.transform = translateText;
        }
        if (!isEnter) {
          element.on('transitionend', function () {
            // Scroll so that the top of the slide is shown.
            scrollTo('.view-wrapper', {direction: 'upward'});
          });
        }
        done();
      };
    }
    return {
      enter: updateTranslateAmount(true),
      leave: updateTranslateAmount(false)
    };
  }]);
