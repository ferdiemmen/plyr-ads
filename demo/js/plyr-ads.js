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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PlyrAds = function () {
  function PlyrAds(target, options) {
    _classCallCheck(this, PlyrAds);

    this.config = _extends({}, defaults, {
      options: options
    });
  }

  _createClass(PlyrAds, [{
    key: 'foo',
    value: function foo() {
      console.log('bar');
    }
  }]);

  return PlyrAds;
}();

return PlyrAds;

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx5ci1hZHMuanMiLCJzb3VyY2VzIjpbInNyYy9qcy9kZWZhdWx0cy5qcyIsInNyYy9qcy9wbHlyLWFkcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbmNvbnN0IGRlZmF1bHRzID0ge1xuICAgIGFkVGFnVXJsOiAnJyxcbiAgICBza2lwQnV0dG9uOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHRleHQ6ICdTa2lwIGFkJyxcbiAgICAgICAgZGVsYXk6IDEwXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0czsiLCJcbmltcG9ydCBkZWZhdWx0cyBmcm9tICcuL2RlZmF1bHRzJztcblxuY2xhc3MgUGx5ckFkcyB7XG5cbiAgY29uc3RydWN0b3IodGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAuLi5kZWZhdWx0cyxcbiAgICAgIG9wdGlvbnNcbiAgICB9O1xuICB9XG5cbiAgZm9vKCkge1xuICAgIGNvbnNvbGUubG9nKCdiYXInKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbHlyQWRzO1xuIl0sIm5hbWVzIjpbImRlZmF1bHRzIiwiUGx5ckFkcyIsInRhcmdldCIsIm9wdGlvbnMiLCJjb25maWciLCJsb2ciXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLElBQU1BLFdBQVc7Y0FDSCxFQURHO2dCQUVEO2lCQUNDLElBREQ7Y0FFRixTQUZFO2VBR0Q7O0NBTGY7Ozs7Ozs7O0FDQUEsSUFFTUM7bUJBRVFDLE1BQVosRUFBb0JDLE9BQXBCLEVBQTZCOzs7U0FDdEJDLE1BQUwsZ0JBQ0tKLFFBREw7Ozs7Ozs7MEJBTUk7Y0FDSUssR0FBUixDQUFZLEtBQVo7Ozs7Ozs7Ozs7Ozs7In0=
