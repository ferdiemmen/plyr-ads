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
    this.adDisplayElement;

    // Check if a adTagUrl us provided.
    if (!this.config.adTagUrl) {
      throw Error('No adTagUrl provided.');
    }

    // Check if the Google IMA3 SDK is loaded.
    if (!window.google) {
      throw new Error('The Google IMA3 SDK is not loaded.');
    }

    // Setup the ad display container.
    this._setupAdDisplayContainer();

    // Request video ads.
    this.adsRequest = new google.ima.AdsRequest();
    this.adsRequest.adTagUrl = this.config.adTagUrl;

    // Set listeners on plyr media events.
    this._setListeners();
  }

  _createClass(PlyrAds, [{
    key: '_setupAdDisplayContainer',
    value: function _setupAdDisplayContainer() {
      var _plyr$elements = this.plyr.elements,
          wrapper = _plyr$elements.wrapper,
          original = _plyr$elements.original;

      // We assume the adContainer is the video wrapper of the plyr element that will house
      // the ads.

      this.adDisplayContainer = new google.ima.AdDisplayContainer(wrapper, original);

      this.adDisplayElement = wrapper.firstChild;

      // The AdDisplayContainer call from google ima sets the style attribute
      // by default. We remove the inline style and set it through the stylesheet.
      this.adDisplayElement.removeAttribute('style');

      // Set class name on the adDisplayContainer element
      this.adDisplayElement.setAttribute('class', 'plyr-ads');
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx5ci1hZHMuanMiLCJzb3VyY2VzIjpbInNyYy9qcy9kZWZhdWx0cy5qcyIsInNyYy9qcy9wbHlyLWFkcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbmNvbnN0IGRlZmF1bHRzID0ge1xuICAgIGFkVGFnVXJsOiAnJyxcbiAgICBza2lwQnV0dG9uOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHRleHQ6ICdTa2lwIGFkJyxcbiAgICAgICAgZGVsYXk6IDEwXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0czsiLCJcbmltcG9ydCBkZWZhdWx0cyBmcm9tICcuL2RlZmF1bHRzJztcblxuY2xhc3MgUGx5ckFkcyB7XG5cbiAgY29uc3RydWN0b3IodGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgdGhpcy5jb25maWcgPSB0aGlzLl9tZXJnZWRDb25maWcoZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMucGx5ciA9IHRhcmdldDtcbiAgICB0aGlzLmFkRGlzcGxheUNvbnRhaW5lcjtcbiAgICB0aGlzLmFkRGlzcGxheUVsZW1lbnQ7XG5cbiAgICAvLyBDaGVjayBpZiBhIGFkVGFnVXJsIHVzIHByb3ZpZGVkLlxuICAgIGlmICghdGhpcy5jb25maWcuYWRUYWdVcmwpIHsgdGhyb3cgRXJyb3IoJ05vIGFkVGFnVXJsIHByb3ZpZGVkLicpOyB9XG5cbiAgICAvLyBDaGVjayBpZiB0aGUgR29vZ2xlIElNQTMgU0RLIGlzIGxvYWRlZC5cbiAgICBpZiAoIXdpbmRvdy5nb29nbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdUaGUgR29vZ2xlIElNQTMgU0RLIGlzIG5vdCBsb2FkZWQuJyk7IH1cblxuICAgIC8vIFNldHVwIHRoZSBhZCBkaXNwbGF5IGNvbnRhaW5lci5cbiAgICB0aGlzLl9zZXR1cEFkRGlzcGxheUNvbnRhaW5lcigpO1xuXG4gICAgLy8gUmVxdWVzdCB2aWRlbyBhZHMuXG4gICAgdGhpcy5hZHNSZXF1ZXN0ID0gbmV3IGdvb2dsZS5pbWEuQWRzUmVxdWVzdCgpO1xuICAgIHRoaXMuYWRzUmVxdWVzdC5hZFRhZ1VybCA9IHRoaXMuY29uZmlnLmFkVGFnVXJsO1xuXG4gICAgLy8gU2V0IGxpc3RlbmVycyBvbiBwbHlyIG1lZGlhIGV2ZW50cy5cbiAgICB0aGlzLl9zZXRMaXN0ZW5lcnMoKTtcbiAgfVxuXG5cbiAgX3NldHVwQWREaXNwbGF5Q29udGFpbmVyKCkge1xuICAgIGNvbnN0IHsgd3JhcHBlciwgb3JpZ2luYWwgfSA9IHRoaXMucGx5ci5lbGVtZW50cztcbiAgICBcbiAgICAvLyBXZSBhc3N1bWUgdGhlIGFkQ29udGFpbmVyIGlzIHRoZSB2aWRlbyB3cmFwcGVyIG9mIHRoZSBwbHlyIGVsZW1lbnQgdGhhdCB3aWxsIGhvdXNlXG4gICAgLy8gdGhlIGFkcy5cbiAgICB0aGlzLmFkRGlzcGxheUNvbnRhaW5lciA9IG5ldyBnb29nbGUuaW1hLkFkRGlzcGxheUNvbnRhaW5lcihcbiAgICAgICAgd3JhcHBlciwgb3JpZ2luYWwpO1xuXG4gICAgdGhpcy5hZERpc3BsYXlFbGVtZW50ID0gd3JhcHBlci5maXJzdENoaWxkO1xuXG4gICAgLy8gVGhlIEFkRGlzcGxheUNvbnRhaW5lciBjYWxsIGZyb20gZ29vZ2xlIGltYSBzZXRzIHRoZSBzdHlsZSBhdHRyaWJ1dGVcbiAgICAvLyBieSBkZWZhdWx0LiBXZSByZW1vdmUgdGhlIGlubGluZSBzdHlsZSBhbmQgc2V0IGl0IHRocm91Z2ggdGhlIHN0eWxlc2hlZXQuXG4gICAgdGhpcy5hZERpc3BsYXlFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcbiAgICBcbiAgICAvLyBTZXQgY2xhc3MgbmFtZSBvbiB0aGUgYWREaXNwbGF5Q29udGFpbmVyIGVsZW1lbnRcbiAgICB0aGlzLmFkRGlzcGxheUVsZW1lbnQuc2V0QXR0cmlidXRlKCdjbGFzcycsICdwbHlyLWFkcycpO1xuICB9XG5cbiAgLy8gTWVyZ2UgZGVmYXVsdHMgYW5kIG9wdGlvbnMuXG4gIF9tZXJnZWRDb25maWcoZGVmYXVsdHMsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gey4uLmRlZmF1bHRzLCAuLi5vcHRpb25zfTtcbiAgfVxuXG4gIF9zZXRMaXN0ZW5lcnMoKSB7XG5cbiAgICAvLyBQcm9ncmVzc1xuICAgIHRoaXMucGx5ci5vbigncHJvZ3Jlc3MnLCAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHsgY3VycmVudFRpbWUgfSA9IGV2ZW50LmRldGFpbC5wbHlyO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgaW5pdDogKHRhcmdldCwgb3B0aW9ucykgPT4gbmV3IFBseXJBZHModGFyZ2V0LCBvcHRpb25zKVxufTtcbiJdLCJuYW1lcyI6WyJkZWZhdWx0cyIsIlBseXJBZHMiLCJ0YXJnZXQiLCJvcHRpb25zIiwiY29uZmlnIiwiX21lcmdlZENvbmZpZyIsInBseXIiLCJhZERpc3BsYXlDb250YWluZXIiLCJhZERpc3BsYXlFbGVtZW50IiwiYWRUYWdVcmwiLCJFcnJvciIsIndpbmRvdyIsImdvb2dsZSIsIl9zZXR1cEFkRGlzcGxheUNvbnRhaW5lciIsImFkc1JlcXVlc3QiLCJpbWEiLCJBZHNSZXF1ZXN0IiwiX3NldExpc3RlbmVycyIsImVsZW1lbnRzIiwid3JhcHBlciIsIm9yaWdpbmFsIiwiQWREaXNwbGF5Q29udGFpbmVyIiwiZmlyc3RDaGlsZCIsInJlbW92ZUF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsIm9uIiwiZXZlbnQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLElBQU1BLFdBQVc7Y0FDSCxFQURHO2dCQUVEO2lCQUNDLElBREQ7Y0FFRixTQUZFO2VBR0Q7O0NBTGY7Ozs7Ozs7O0FDQUEsSUFFTUM7bUJBRVFDLE1BQVosRUFBb0JDLE9BQXBCLEVBQTZCOzs7U0FDdEJDLE1BQUwsR0FBYyxLQUFLQyxhQUFMLENBQW1CTCxRQUFuQixFQUE2QkcsT0FBN0IsQ0FBZDtTQUNLRyxJQUFMLEdBQVlKLE1BQVo7U0FDS0ssa0JBQUw7U0FDS0MsZ0JBQUw7OztRQUdJLENBQUMsS0FBS0osTUFBTCxDQUFZSyxRQUFqQixFQUEyQjtZQUFRQyxNQUFNLHVCQUFOLENBQU47Ozs7UUFHekIsQ0FBQ0MsT0FBT0MsTUFBWixFQUFvQjtZQUFRLElBQUlGLEtBQUosQ0FBVSxvQ0FBVixDQUFOOzs7O1NBR2pCRyx3QkFBTDs7O1NBR0tDLFVBQUwsR0FBa0IsSUFBSUYsT0FBT0csR0FBUCxDQUFXQyxVQUFmLEVBQWxCO1NBQ0tGLFVBQUwsQ0FBZ0JMLFFBQWhCLEdBQTJCLEtBQUtMLE1BQUwsQ0FBWUssUUFBdkM7OztTQUdLUSxhQUFMOzs7OzsrQ0FJeUI7MkJBQ0ssS0FBS1gsSUFBTCxDQUFVWSxRQURmO1VBQ2pCQyxPQURpQixrQkFDakJBLE9BRGlCO1VBQ1JDLFFBRFEsa0JBQ1JBLFFBRFE7Ozs7O1dBS3BCYixrQkFBTCxHQUEwQixJQUFJSyxPQUFPRyxHQUFQLENBQVdNLGtCQUFmLENBQ3RCRixPQURzQixFQUNiQyxRQURhLENBQTFCOztXQUdLWixnQkFBTCxHQUF3QlcsUUFBUUcsVUFBaEM7Ozs7V0FJS2QsZ0JBQUwsQ0FBc0JlLGVBQXRCLENBQXNDLE9BQXRDOzs7V0FHS2YsZ0JBQUwsQ0FBc0JnQixZQUF0QixDQUFtQyxPQUFuQyxFQUE0QyxVQUE1Qzs7Ozs7OztrQ0FJWXhCLGFBQVVHLFNBQVM7MEJBQ3BCSCxXQUFYLEVBQXdCRyxPQUF4Qjs7OztvQ0FHYzs7O1dBR1RHLElBQUwsQ0FBVW1CLEVBQVYsQ0FBYSxVQUFiLEVBQXlCLFVBQUNDLEtBQUQsRUFBVzs7T0FBcEM7Ozs7Ozs7QUFNSixjQUFlO1FBQ1AsY0FBQ3hCLE1BQUQsRUFBU0MsT0FBVDtXQUFxQixJQUFJRixPQUFKLENBQVlDLE1BQVosRUFBb0JDLE9BQXBCLENBQXJCOztDQURSOzs7Ozs7OzsifQ==
