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
    this.adDisplayContainer;

    if (!this.config.adTagUrl) {
      throw Error('No adTagUrl provided.');
    }

    this._createAdDisplayContainer();

    // Request video ads.
    // this.adsRequest = new google.ima.AdsRequest();
    // adsRequest.adTagUrl = config.adTagUrl;

    // Set listeners on plyr media events.
    this._setListeners();
  }

  _createClass(PlyrAds, [{
    key: '_createAdDisplayContainer',
    value: function _createAdDisplayContainer() {
      // We assume the adContainer is the video wrapper of the plyr element that will house
      // the ads.
      var _plyr$elements = this.plyr.elements,
          wrapper = _plyr$elements.wrapper,
          original = _plyr$elements.original;


      this.adDisplayContainer = new google.ima.AdDisplayContainer(wrapper, original);

      console.log(this.adDisplayContainer);
    }

    // Merge defaults and options.

  }, {
    key: '_mergedConfig',
    value: function _mergedConfig(defaults$$1, options) {
      return _extends({}, defaults$$1, options);
    }
  }, {
    key: '_setListeners',
    value: function _setListeners() {

      // Progress
      this.plyr.on('progress', function (event) {
        
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx5ci1hZHMuanMiLCJzb3VyY2VzIjpbInNyYy9qcy9kZWZhdWx0cy5qcyIsInNyYy9qcy9wbHlyLWFkcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbmNvbnN0IGRlZmF1bHRzID0ge1xuICAgIGFkVGFnVXJsOiAnJyxcbiAgICBza2lwQnV0dG9uOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHRleHQ6ICdTa2lwIGFkJyxcbiAgICAgICAgZGVsYXk6IDEwXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0czsiLCJcbmltcG9ydCBkZWZhdWx0cyBmcm9tICcuL2RlZmF1bHRzJztcblxuY2xhc3MgUGx5ckFkcyB7XG5cbiAgY29uc3RydWN0b3IodGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgdGhpcy5jb25maWcgPSB0aGlzLl9tZXJnZWRDb25maWcoZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMucGx5ciA9IHRhcmdldDtcbiAgICB0aGlzLmFkRGlzcGxheUNvbnRhaW5lcjtcblxuICAgIGlmICghdGhpcy5jb25maWcuYWRUYWdVcmwpIHtcbiAgICAgIHRocm93IEVycm9yKCdObyBhZFRhZ1VybCBwcm92aWRlZC4nKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jcmVhdGVBZERpc3BsYXlDb250YWluZXIoKTtcblxuICAgIC8vIFJlcXVlc3QgdmlkZW8gYWRzLlxuICAgIC8vIHRoaXMuYWRzUmVxdWVzdCA9IG5ldyBnb29nbGUuaW1hLkFkc1JlcXVlc3QoKTtcbiAgICAvLyBhZHNSZXF1ZXN0LmFkVGFnVXJsID0gY29uZmlnLmFkVGFnVXJsO1xuXG4gICAgLy8gU2V0IGxpc3RlbmVycyBvbiBwbHlyIG1lZGlhIGV2ZW50cy5cbiAgICB0aGlzLl9zZXRMaXN0ZW5lcnMoKTtcbiAgfVxuXG5cbiAgX2NyZWF0ZUFkRGlzcGxheUNvbnRhaW5lcigpIHtcbiAgICAvLyBXZSBhc3N1bWUgdGhlIGFkQ29udGFpbmVyIGlzIHRoZSB2aWRlbyB3cmFwcGVyIG9mIHRoZSBwbHlyIGVsZW1lbnQgdGhhdCB3aWxsIGhvdXNlXG4gICAgLy8gdGhlIGFkcy5cbiAgICBjb25zdCB7IHdyYXBwZXIsIG9yaWdpbmFsIH0gPSB0aGlzLnBseXIuZWxlbWVudHM7XG5cbiAgICB0aGlzLmFkRGlzcGxheUNvbnRhaW5lciA9IG5ldyBnb29nbGUuaW1hLkFkRGlzcGxheUNvbnRhaW5lcihcbiAgICAgICAgd3JhcHBlciwgb3JpZ2luYWwpO1xuXG4gICAgY29uc29sZS5sb2codGhpcy5hZERpc3BsYXlDb250YWluZXIpO1xuICB9XG5cbiAgLy8gTWVyZ2UgZGVmYXVsdHMgYW5kIG9wdGlvbnMuXG4gIF9tZXJnZWRDb25maWcoZGVmYXVsdHMsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gey4uLmRlZmF1bHRzLCAuLi5vcHRpb25zfTtcbiAgfVxuXG4gIF9zZXRMaXN0ZW5lcnMoKSB7XG5cbiAgICAvLyBQcm9ncmVzc1xuICAgIHRoaXMucGx5ci5vbigncHJvZ3Jlc3MnLCAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHsgY3VycmVudFRpbWUgfSA9IGV2ZW50LmRldGFpbC5wbHlyO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgaW5pdDogKHRhcmdldCwgb3B0aW9ucykgPT4gbmV3IFBseXJBZHModGFyZ2V0LCBvcHRpb25zKVxufTtcbiJdLCJuYW1lcyI6WyJkZWZhdWx0cyIsIlBseXJBZHMiLCJ0YXJnZXQiLCJvcHRpb25zIiwiY29uZmlnIiwiX21lcmdlZENvbmZpZyIsInBseXIiLCJhZERpc3BsYXlDb250YWluZXIiLCJhZFRhZ1VybCIsIkVycm9yIiwiX2NyZWF0ZUFkRGlzcGxheUNvbnRhaW5lciIsIl9zZXRMaXN0ZW5lcnMiLCJlbGVtZW50cyIsIndyYXBwZXIiLCJvcmlnaW5hbCIsImdvb2dsZSIsImltYSIsIkFkRGlzcGxheUNvbnRhaW5lciIsImxvZyIsIm9uIiwiZXZlbnQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLElBQU1BLFdBQVc7Y0FDSCxFQURHO2dCQUVEO2lCQUNDLElBREQ7Y0FFRixTQUZFO2VBR0Q7O0NBTGY7Ozs7Ozs7O0FDQUEsSUFFTUM7bUJBRVFDLE1BQVosRUFBb0JDLE9BQXBCLEVBQTZCOzs7U0FDdEJDLE1BQUwsR0FBYyxLQUFLQyxhQUFMLENBQW1CTCxRQUFuQixFQUE2QkcsT0FBN0IsQ0FBZDtTQUNLRyxJQUFMLEdBQVlKLE1BQVo7U0FDS0ssa0JBQUw7O1FBRUksQ0FBQyxLQUFLSCxNQUFMLENBQVlJLFFBQWpCLEVBQTJCO1lBQ25CQyxNQUFNLHVCQUFOLENBQU47OztTQUdHQyx5QkFBTDs7Ozs7OztTQU9LQyxhQUFMOzs7OztnREFJMEI7OzsyQkFHSSxLQUFLTCxJQUFMLENBQVVNLFFBSGQ7VUFHbEJDLE9BSGtCLGtCQUdsQkEsT0FIa0I7VUFHVEMsUUFIUyxrQkFHVEEsUUFIUzs7O1dBS3JCUCxrQkFBTCxHQUEwQixJQUFJUSxPQUFPQyxHQUFQLENBQVdDLGtCQUFmLENBQ3RCSixPQURzQixFQUNiQyxRQURhLENBQTFCOztjQUdRSSxHQUFSLENBQVksS0FBS1gsa0JBQWpCOzs7Ozs7O2tDQUlZUCxhQUFVRyxTQUFTOzBCQUNwQkgsV0FBWCxFQUF3QkcsT0FBeEI7Ozs7b0NBR2M7OztXQUdURyxJQUFMLENBQVVhLEVBQVYsQ0FBYSxVQUFiLEVBQXlCLFVBQUNDLEtBQUQsRUFBVzs7T0FBcEM7Ozs7Ozs7QUFNSixjQUFlO1FBQ1AsY0FBQ2xCLE1BQUQsRUFBU0MsT0FBVDtXQUFxQixJQUFJRixPQUFKLENBQVlDLE1BQVosRUFBb0JDLE9BQXBCLENBQXJCOztDQURSOzs7Ozs7OzsifQ==
