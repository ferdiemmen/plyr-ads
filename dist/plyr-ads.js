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

    this.config = this._mergedConfig(defaults, options);
    this.plyr = target;

    // Set listeners on plyr media events
    this._setListeners();
  }

  _createClass(PlyrAds, [{
    key: '_mergedConfig',
    value: function _mergedConfig(defaults$$1, options) {
      return _extends({}, defaults$$1, options);
    }
  }, {
    key: '_setListeners',
    value: function _setListeners() {

      // Progress
      this.plyr.on('progress', function (event) {
        var currentTime = event.detail.plyr.currentTime;

        console.log(currentTime);
      });
    }
  }]);

  return PlyrAds;
}();

var plyrAds = {
  init: function init(target, options) {
    return new PlyrAds(target, options);
  }
};

return plyrAds;

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx5ci1hZHMuanMiLCJzb3VyY2VzIjpbInNyYy9qcy9kZWZhdWx0cy5qcyIsInNyYy9qcy9wbHlyLWFkcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbmNvbnN0IGRlZmF1bHRzID0ge1xuICAgIGFkVGFnVXJsOiAnJyxcbiAgICBza2lwQnV0dG9uOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHRleHQ6ICdTa2lwIGFkJyxcbiAgICAgICAgZGVsYXk6IDEwXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0czsiLCJcbmltcG9ydCBkZWZhdWx0cyBmcm9tICcuL2RlZmF1bHRzJztcblxuY2xhc3MgUGx5ckFkcyB7XG5cbiAgY29uc3RydWN0b3IodGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgdGhpcy5jb25maWcgPSB0aGlzLl9tZXJnZWRDb25maWcoZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMucGx5ciA9IHRhcmdldDtcblxuICAgIC8vIFNldCBsaXN0ZW5lcnMgb24gcGx5ciBtZWRpYSBldmVudHNcbiAgICB0aGlzLl9zZXRMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIF9tZXJnZWRDb25maWcoZGVmYXVsdHMsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gey4uLmRlZmF1bHRzLCAuLi5vcHRpb25zfTtcbiAgfVxuXG4gIF9zZXRMaXN0ZW5lcnMoKSB7XG5cbiAgICAvLyBQcm9ncmVzc1xuICAgIHRoaXMucGx5ci5vbigncHJvZ3Jlc3MnLCAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHsgY3VycmVudFRpbWUgfSA9IGV2ZW50LmRldGFpbC5wbHlyO1xuICAgICAgY29uc29sZS5sb2coY3VycmVudFRpbWUpO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgaW5pdDogKHRhcmdldCwgb3B0aW9ucykgPT4gbmV3IFBseXJBZHModGFyZ2V0LCBvcHRpb25zKVxufTtcbiJdLCJuYW1lcyI6WyJkZWZhdWx0cyIsIlBseXJBZHMiLCJ0YXJnZXQiLCJvcHRpb25zIiwiY29uZmlnIiwiX21lcmdlZENvbmZpZyIsInBseXIiLCJfc2V0TGlzdGVuZXJzIiwib24iLCJldmVudCIsImN1cnJlbnRUaW1lIiwiZGV0YWlsIiwibG9nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxJQUFNQSxXQUFXO2NBQ0gsRUFERztnQkFFRDtpQkFDQyxJQUREO2NBRUYsU0FGRTtlQUdEOztDQUxmOzs7Ozs7OztBQ0FBLElBRU1DO21CQUVRQyxNQUFaLEVBQW9CQyxPQUFwQixFQUE2Qjs7O1NBQ3RCQyxNQUFMLEdBQWMsS0FBS0MsYUFBTCxDQUFtQkwsUUFBbkIsRUFBNkJHLE9BQTdCLENBQWQ7U0FDS0csSUFBTCxHQUFZSixNQUFaOzs7U0FHS0ssYUFBTDs7Ozs7a0NBR1lQLGFBQVVHLFNBQVM7MEJBQ3BCSCxXQUFYLEVBQXdCRyxPQUF4Qjs7OztvQ0FHYzs7O1dBR1RHLElBQUwsQ0FBVUUsRUFBVixDQUFhLFVBQWIsRUFBeUIsVUFBQ0MsS0FBRCxFQUFXO1lBQzFCQyxXQUQwQixHQUNWRCxNQUFNRSxNQUFOLENBQWFMLElBREgsQ0FDMUJJLFdBRDBCOztnQkFFMUJFLEdBQVIsQ0FBWUYsV0FBWjtPQUZGOzs7Ozs7O0FBT0osY0FBZTtRQUNQLGNBQUNSLE1BQUQsRUFBU0MsT0FBVDtXQUFxQixJQUFJRixPQUFKLENBQVlDLE1BQVosRUFBb0JDLE9BQXBCLENBQXJCOztDQURSOzs7Ozs7OzsifQ==
