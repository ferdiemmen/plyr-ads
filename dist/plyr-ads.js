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
    this.config.startEvents = this._getStartEvents();

    this.plyr = target;
    this.adDisplayContainer;
    this.adDisplayElement;

    // Check if a adTagUrl us provided.
    if (!this.config.adTagUrl) {
      throw new Error('No adTagUrl provided.');
    }

    // Check if the Google IMA3 SDK is loaded.
    if (!window.google) {
      throw new Error('The Google IMA3 SDK is not loaded.');
    }

    // Setup the ad display container.
    this._setupAdDisplayContainer();

    this._setupIMA();

    // Set listeners on plyr media events.
    this._setListeners();
  }

  _createClass(PlyrAds, [{
    key: '_setupIMA',
    value: function _setupIMA() {
      // Request video ads.
      this.adsRequest = new google.ima.AdsRequest();
      this.adsRequest.adTagUrl = 'https'; // this.config.adTagUrl;
    }
  }, {
    key: '_setupAdDisplayContainer',
    value: function _setupAdDisplayContainer() {
      var _plyr$elements = this.plyr.elements,
          container = _plyr$elements.container,
          original = _plyr$elements.original;

      // We assume the adContainer is the video container of the plyr element
      // that will house the ads.

      this.adDisplayContainer = new google.ima.AdDisplayContainer(container, original);

      this.adDisplayElement = container.firstChild;

      // The AdDisplayContainer call from google ima sets the style attribute
      // by default. We remove the inline style and set it through the stylesheet.
      this.adDisplayElement.removeAttribute('style');

      // Set class name on the adDisplayContainer element.
      this.adDisplayElement.setAttribute('class', 'plyr-ads');

      // Play ads when clicked.
      this._setOnClickHandler(this.adDisplayElement, this._playAds);
    }
  }, {
    key: '_playAds',
    value: function _playAds() {
      var container = this.plyr.elements.container;

      // Initialize the container. Must be done via a user action on mobile devices.

      this.adDisplayContainer.initialize();

      try {
        // Initialize the ads manager. Ad rules playlist will start at this time.
        this.adsManager.init(container.offsetWidth, container.offsetHeight, window.google.ima.ViewMode.NORMAL);

        // Call play to start showing the ad. Single video and overlay ads will
        // start at this time; the call will be ignored for ad rules.
        this.adsManager.start();
      } catch (adError) {

        // An error may be thrown if there was a problem with the VAST response.
        this.plyr.play();
        this.adDisplayElement.remove();

        if (this.config.debug) {
          throw new Error(adError);
        }
      }
    }

    // Set's a click event listener on a DOM element and triggers the
    // callback when clicked. 

  }, {
    key: '_setOnClickHandler',
    value: function _setOnClickHandler(element, callback) {
      var _this = this;

      var _loop = function _loop(startEvent) {
        element.addEventListener(startEvent, function (event) {
          if (event.type === 'touchend' && startEvent === 'touchstart' || event.type === 'click') {
            callback.call(_this);
          }
        }, { once: true });
      };

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.config.startEvents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var startEvent = _step.value;

          _loop(startEvent);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
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

      var time = 0;

      // timeupdate
      this.plyr.on('timeupdate', function (event) {
        var currentTime = event.detail.plyr.currentTime;


        if (time !== Math.ceil(currentTime)) {
          switch (time) {
            case 15:
              console.log('15');
              break;
            default:
              console.log(time);
          }
        }

        time = Math.ceil(currentTime);
      });
    }

    // Set the correct event, based on userAgent.

  }, {
    key: '_getStartEvents',
    value: function _getStartEvents() {
      var startEvents = ['click'];

      // For mobile users the start event will be one of
      // touchstart, touchend and touchmove.
      if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/Android/i)) {
        startEvents = ['touchstart', 'touchend', 'touchmove'];
      }
      return startEvents;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx5ci1hZHMuanMiLCJzb3VyY2VzIjpbInNyYy9qcy9kZWZhdWx0cy5qcyIsInNyYy9qcy9wbHlyLWFkcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbmNvbnN0IGRlZmF1bHRzID0ge1xuICAgIGFkVGFnVXJsOiAnJyxcbiAgICBza2lwQnV0dG9uOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHRleHQ6ICdTa2lwIGFkJyxcbiAgICAgICAgZGVsYXk6IDEwXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0czsiLCJcbmltcG9ydCBkZWZhdWx0cyBmcm9tICcuL2RlZmF1bHRzJztcblxuY2xhc3MgUGx5ckFkcyB7XG5cbiAgY29uc3RydWN0b3IodGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgdGhpcy5jb25maWcgPSB0aGlzLl9tZXJnZWRDb25maWcoZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMuY29uZmlnLnN0YXJ0RXZlbnRzID0gdGhpcy5fZ2V0U3RhcnRFdmVudHMoKTtcbiAgICBcbiAgICB0aGlzLnBseXIgPSB0YXJnZXQ7XG4gICAgdGhpcy5hZERpc3BsYXlDb250YWluZXI7XG4gICAgdGhpcy5hZERpc3BsYXlFbGVtZW50O1xuXG4gICAgLy8gQ2hlY2sgaWYgYSBhZFRhZ1VybCB1cyBwcm92aWRlZC5cbiAgICBpZiAoIXRoaXMuY29uZmlnLmFkVGFnVXJsKSB7IHRocm93IG5ldyBFcnJvcignTm8gYWRUYWdVcmwgcHJvdmlkZWQuJyk7IH1cblxuICAgIC8vIENoZWNrIGlmIHRoZSBHb29nbGUgSU1BMyBTREsgaXMgbG9hZGVkLlxuICAgIGlmICghd2luZG93Lmdvb2dsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBHb29nbGUgSU1BMyBTREsgaXMgbm90IGxvYWRlZC4nKTsgfVxuXG4gICAgLy8gU2V0dXAgdGhlIGFkIGRpc3BsYXkgY29udGFpbmVyLlxuICAgIHRoaXMuX3NldHVwQWREaXNwbGF5Q29udGFpbmVyKCk7XG5cbiAgICB0aGlzLl9zZXR1cElNQSgpO1xuXG4gICAgLy8gU2V0IGxpc3RlbmVycyBvbiBwbHlyIG1lZGlhIGV2ZW50cy5cbiAgICB0aGlzLl9zZXRMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIF9zZXR1cElNQSgpIHtcbiAgICAvLyBSZXF1ZXN0IHZpZGVvIGFkcy5cbiAgICB0aGlzLmFkc1JlcXVlc3QgPSBuZXcgZ29vZ2xlLmltYS5BZHNSZXF1ZXN0KCk7XG4gICAgdGhpcy5hZHNSZXF1ZXN0LmFkVGFnVXJsID0gJ2h0dHBzJyAvLyB0aGlzLmNvbmZpZy5hZFRhZ1VybDtcbiAgfVxuXG4gIF9zZXR1cEFkRGlzcGxheUNvbnRhaW5lcigpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciwgb3JpZ2luYWwgfSA9IHRoaXMucGx5ci5lbGVtZW50cztcbiAgICBcbiAgICAvLyBXZSBhc3N1bWUgdGhlIGFkQ29udGFpbmVyIGlzIHRoZSB2aWRlbyBjb250YWluZXIgb2YgdGhlIHBseXIgZWxlbWVudFxuICAgIC8vIHRoYXQgd2lsbCBob3VzZSB0aGUgYWRzLlxuICAgIHRoaXMuYWREaXNwbGF5Q29udGFpbmVyID0gbmV3IGdvb2dsZS5pbWEuQWREaXNwbGF5Q29udGFpbmVyKFxuICAgICAgICBjb250YWluZXIsIG9yaWdpbmFsKTtcblxuICAgIHRoaXMuYWREaXNwbGF5RWxlbWVudCA9IGNvbnRhaW5lci5maXJzdENoaWxkO1xuXG4gICAgLy8gVGhlIEFkRGlzcGxheUNvbnRhaW5lciBjYWxsIGZyb20gZ29vZ2xlIGltYSBzZXRzIHRoZSBzdHlsZSBhdHRyaWJ1dGVcbiAgICAvLyBieSBkZWZhdWx0LiBXZSByZW1vdmUgdGhlIGlubGluZSBzdHlsZSBhbmQgc2V0IGl0IHRocm91Z2ggdGhlIHN0eWxlc2hlZXQuXG4gICAgdGhpcy5hZERpc3BsYXlFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcbiAgICBcbiAgICAvLyBTZXQgY2xhc3MgbmFtZSBvbiB0aGUgYWREaXNwbGF5Q29udGFpbmVyIGVsZW1lbnQuXG4gICAgdGhpcy5hZERpc3BsYXlFbGVtZW50LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAncGx5ci1hZHMnKTtcblxuICAgIC8vIFBsYXkgYWRzIHdoZW4gY2xpY2tlZC5cbiAgICB0aGlzLl9zZXRPbkNsaWNrSGFuZGxlcih0aGlzLmFkRGlzcGxheUVsZW1lbnQsIHRoaXMuX3BsYXlBZHMpO1xuICB9XG5cbiAgX3BsYXlBZHMoKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIgfSA9IHRoaXMucGx5ci5lbGVtZW50cztcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIGNvbnRhaW5lci4gTXVzdCBiZSBkb25lIHZpYSBhIHVzZXIgYWN0aW9uIG9uIG1vYmlsZSBkZXZpY2VzLlxuICAgIHRoaXMuYWREaXNwbGF5Q29udGFpbmVyLmluaXRpYWxpemUoKTtcblxuICAgIHRyeSB7XG4gICAgICAvLyBJbml0aWFsaXplIHRoZSBhZHMgbWFuYWdlci4gQWQgcnVsZXMgcGxheWxpc3Qgd2lsbCBzdGFydCBhdCB0aGlzIHRpbWUuXG4gICAgICB0aGlzLmFkc01hbmFnZXIuaW5pdChcbiAgICAgICAgY29udGFpbmVyLm9mZnNldFdpZHRoLFxuICAgICAgICBjb250YWluZXIub2Zmc2V0SGVpZ2h0LFxuICAgICAgICB3aW5kb3cuZ29vZ2xlLmltYS5WaWV3TW9kZS5OT1JNQUxcbiAgICAgICk7XG4gIFxuICAgICAgLy8gQ2FsbCBwbGF5IHRvIHN0YXJ0IHNob3dpbmcgdGhlIGFkLiBTaW5nbGUgdmlkZW8gYW5kIG92ZXJsYXkgYWRzIHdpbGxcbiAgICAgIC8vIHN0YXJ0IGF0IHRoaXMgdGltZTsgdGhlIGNhbGwgd2lsbCBiZSBpZ25vcmVkIGZvciBhZCBydWxlcy5cbiAgICAgIHRoaXMuYWRzTWFuYWdlci5zdGFydCgpO1xuICAgIFxuICAgIH0gY2F0Y2ggKGFkRXJyb3IpIHtcblxuICAgICAgLy8gQW4gZXJyb3IgbWF5IGJlIHRocm93biBpZiB0aGVyZSB3YXMgYSBwcm9ibGVtIHdpdGggdGhlIFZBU1QgcmVzcG9uc2UuXG4gICAgICB0aGlzLnBseXIucGxheSgpO1xuICAgICAgdGhpcy5hZERpc3BsYXlFbGVtZW50LnJlbW92ZSgpO1xuXG4gICAgICBpZiAodGhpcy5jb25maWcuZGVidWcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGFkRXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFNldCdzIGEgY2xpY2sgZXZlbnQgbGlzdGVuZXIgb24gYSBET00gZWxlbWVudCBhbmQgdHJpZ2dlcnMgdGhlXG4gIC8vIGNhbGxiYWNrIHdoZW4gY2xpY2tlZC4gXG4gIF9zZXRPbkNsaWNrSGFuZGxlcihlbGVtZW50LCBjYWxsYmFjaykge1xuICAgIGZvciAobGV0IHN0YXJ0RXZlbnQgb2YgdGhpcy5jb25maWcuc3RhcnRFdmVudHMpIHtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihzdGFydEV2ZW50LCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICd0b3VjaGVuZCcgJiZcbiAgICAgICAgICAgIHN0YXJ0RXZlbnQgPT09ICd0b3VjaHN0YXJ0JyB8fFxuICAgICAgICAgICAgZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH0sIHtvbmNlOiB0cnVlfSk7XG4gICAgfVxuICB9XG5cblxuICAvLyBNZXJnZSBkZWZhdWx0cyBhbmQgb3B0aW9ucy5cbiAgX21lcmdlZENvbmZpZyhkZWZhdWx0cywgb3B0aW9ucykge1xuICAgIHJldHVybiB7Li4uZGVmYXVsdHMsIC4uLm9wdGlvbnN9O1xuICB9XG5cbiAgX3NldExpc3RlbmVycygpIHtcblxuICAgIGxldCB0aW1lID0gMDtcblxuICAgIC8vIHRpbWV1cGRhdGVcbiAgICB0aGlzLnBseXIub24oJ3RpbWV1cGRhdGUnLCAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHsgY3VycmVudFRpbWUgfSA9IGV2ZW50LmRldGFpbC5wbHlyO1xuXG4gICAgICBpZiAodGltZSAhPT0gTWF0aC5jZWlsKGN1cnJlbnRUaW1lKSkge1xuICAgICAgICBzd2l0Y2godGltZSkge1xuICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnMTUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICB0aW1lID0gTWF0aC5jZWlsKGN1cnJlbnRUaW1lKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFNldCB0aGUgY29ycmVjdCBldmVudCwgYmFzZWQgb24gdXNlckFnZW50LlxuICBfZ2V0U3RhcnRFdmVudHMoKSB7XG4gICAgbGV0IHN0YXJ0RXZlbnRzID0gWydjbGljayddO1xuICAgIFxuICAgIC8vIEZvciBtb2JpbGUgdXNlcnMgdGhlIHN0YXJ0IGV2ZW50IHdpbGwgYmUgb25lIG9mXG4gICAgLy8gdG91Y2hzdGFydCwgdG91Y2hlbmQgYW5kIHRvdWNobW92ZS5cbiAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvaVBob25lL2kpIHx8XG4gICAgICAgIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2lQYWQvaSkgfHxcbiAgICAgICAgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvQW5kcm9pZC9pKSkge1xuICAgICAgICBzdGFydEV2ZW50cyA9IFsndG91Y2hzdGFydCcsICd0b3VjaGVuZCcsICd0b3VjaG1vdmUnXTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXJ0RXZlbnRzO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgaW5pdDogKHRhcmdldCwgb3B0aW9ucykgPT4gbmV3IFBseXJBZHModGFyZ2V0LCBvcHRpb25zKVxufTtcbiJdLCJuYW1lcyI6WyJkZWZhdWx0cyIsIlBseXJBZHMiLCJ0YXJnZXQiLCJvcHRpb25zIiwiY29uZmlnIiwiX21lcmdlZENvbmZpZyIsInN0YXJ0RXZlbnRzIiwiX2dldFN0YXJ0RXZlbnRzIiwicGx5ciIsImFkRGlzcGxheUNvbnRhaW5lciIsImFkRGlzcGxheUVsZW1lbnQiLCJhZFRhZ1VybCIsIkVycm9yIiwid2luZG93IiwiZ29vZ2xlIiwiX3NldHVwQWREaXNwbGF5Q29udGFpbmVyIiwiX3NldHVwSU1BIiwiX3NldExpc3RlbmVycyIsImFkc1JlcXVlc3QiLCJpbWEiLCJBZHNSZXF1ZXN0IiwiZWxlbWVudHMiLCJjb250YWluZXIiLCJvcmlnaW5hbCIsIkFkRGlzcGxheUNvbnRhaW5lciIsImZpcnN0Q2hpbGQiLCJyZW1vdmVBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJfc2V0T25DbGlja0hhbmRsZXIiLCJfcGxheUFkcyIsImluaXRpYWxpemUiLCJhZHNNYW5hZ2VyIiwiaW5pdCIsIm9mZnNldFdpZHRoIiwib2Zmc2V0SGVpZ2h0IiwiVmlld01vZGUiLCJOT1JNQUwiLCJzdGFydCIsImFkRXJyb3IiLCJwbGF5IiwicmVtb3ZlIiwiZGVidWciLCJlbGVtZW50IiwiY2FsbGJhY2siLCJzdGFydEV2ZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwidHlwZSIsImNhbGwiLCJvbmNlIiwidGltZSIsIm9uIiwiY3VycmVudFRpbWUiLCJkZXRhaWwiLCJNYXRoIiwiY2VpbCIsImxvZyIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsIm1hdGNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxJQUFNQSxXQUFXO2NBQ0gsRUFERztnQkFFRDtpQkFDQyxJQUREO2NBRUYsU0FGRTtlQUdEOztDQUxmOzs7Ozs7OztBQ0FBLElBRU1DO21CQUVRQyxNQUFaLEVBQW9CQyxPQUFwQixFQUE2Qjs7O1NBQ3RCQyxNQUFMLEdBQWMsS0FBS0MsYUFBTCxDQUFtQkwsUUFBbkIsRUFBNkJHLE9BQTdCLENBQWQ7U0FDS0MsTUFBTCxDQUFZRSxXQUFaLEdBQTBCLEtBQUtDLGVBQUwsRUFBMUI7O1NBRUtDLElBQUwsR0FBWU4sTUFBWjtTQUNL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
