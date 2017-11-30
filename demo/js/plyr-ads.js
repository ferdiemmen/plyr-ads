(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('PlyrAds', factory) :
	(global.PlyrAds = factory());
}(this, (function () { 'use strict';

var defaults = {
    adTagUrl: '',
    skipButton: {
        enabled: true,
        text: 'Skip ad',
        delay: 10
    }
};

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PlyrAds = function PlyrAds(target, options) {
  _classCallCheck(this, PlyrAds);

  this.config = _extends({}, defaults, {
    options: options
  });
};

return PlyrAds;

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx5ci1hZHMuanMiLCJzb3VyY2VzIjpbInNyYy9qcy9kZWZhdWx0cy5qcyIsInNyYy9qcy9wbHlyLWFkcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbmNvbnN0IGRlZmF1bHRzID0ge1xuICAgIGFkVGFnVXJsOiAnJyxcbiAgICBza2lwQnV0dG9uOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHRleHQ6ICdTa2lwIGFkJyxcbiAgICAgICAgZGVsYXk6IDEwXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0czsiLCJcbmltcG9ydCBkZWZhdWx0cyBmcm9tICcuL2RlZmF1bHRzJztcblxuY2xhc3MgUGx5ckFkcyB7XG5cbiAgY29uc3RydWN0b3IodGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAuLi5kZWZhdWx0cyxcbiAgICAgIG9wdGlvbnNcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBseXJBZHM7XG4iXSwibmFtZXMiOlsiZGVmYXVsdHMiLCJQbHlyQWRzIiwidGFyZ2V0Iiwib3B0aW9ucyIsImNvbmZpZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsSUFBTUEsV0FBVztjQUNILEVBREc7Z0JBRUQ7aUJBQ0MsSUFERDtjQUVGLFNBRkU7ZUFHRDs7Q0FMZjs7Ozs7O0FDQUEsSUFFTUMsVUFFSixpQkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFBNkI7OztPQUN0QkMsTUFBTCxnQkFDS0osUUFETDs7Ozs7Ozs7Ozs7In0=
