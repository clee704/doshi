'use strict';

angular.module('doshi')

  // Returns the first CSS rule that matches the given selector.
  // The current implementation is just good enough for the current usage of
  // this function in this app. For example, it doesn't look into media rules,
  // so any rules that in media queres are not considered.
  .factory('getCssRule', function ($window) {
    var styleElement = $window.document.createElement('style');
    $window.document.head.appendChild(styleElement);
    var styleSheet = styleElement.sheet;

    // Rewrite the CSS selector in the same way the web browser does.
    function rewriteSelector(selector) {
      var n = styleSheet.insertRule(selector + '{}', styleSheet.cssRules.length);
      var rewrittenSelector = styleSheet.cssRules[n].selectorText;
      styleSheet.deleteRule(n);
      return rewrittenSelector;
    }

    return function (selector) {
      selector = rewriteSelector(selector);
      var stylesheets = $window.document.styleSheets;
      for (var i = 0; i < stylesheets.length; i++) {
        var stylesheet = stylesheets[i];
        var rules = stylesheet.cssRules;
        for (var j = 0; j < rules.length; j++) {
          var rule = rules[j];
          if (rule.type !== CSSRule.STYLE_RULE) continue;
          if (rule.selectorText === selector) {
            return rule;
          }
        }
      }
    };
  });
