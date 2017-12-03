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
    this.adsManager;
    this.currentTime = 0;

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
      var adsRequest = new google.ima.AdsRequest();
      adsRequest.adTagUrl = this.config.adTagUrl;

      // Create ads loader.
      this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);

      // Listen and respond to ads loaded and error events.
      this.adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this._onAdsManagerLoaded.bind(this), false);
      this.adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._onAdError.bind(this), false);

      // An event listener to tell the SDK that our content video
      // is completed so the SDK can play any post-roll ads.
      // const contentEndedListener = () => { 
      //   this.adsLoader.contentComplete();
      // };
      // videoContent.onended = contentEndedListener;

      // Specify the linear and nonlinear slot sizes. This helps the SDK to
      // select the correct creative if multiple are returned.
      adsRequest.linearAdSlotWidth = 640;
      adsRequest.linearAdSlotHeight = 400;

      adsRequest.nonLinearAdSlotWidth = 640;
      adsRequest.nonLinearAdSlotHeight = 150;

      this.adsLoader.requestAds(adsRequest);
    }
  }, {
    key: '_onAdsManagerLoaded',
    value: function _onAdsManagerLoaded(adsManagerLoadedEvent) {
      var adsRenderingSettings = new google.ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

      var contentPlayback = {
        currentTime: this.currentTime,
        duration: this.plyr.duration
      };

      // videoContent should be set to the content video element.
      this.adsManager = adsManagerLoadedEvent.getAdsManager(contentPlayback, adsRenderingSettings);

      // console.log(this.adsManager.getCuePoints());

      // Add listeners to the required events.
      this.adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._onAdError.bind(this));
      this.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this._onContentPauseRequested.bind(this));
      this.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this._onContentResumeRequested.bind(this));
      this.adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, this._onAdEvent.bind(this));

      // Listen to any additional events, if necessary.
      this.adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, this._onAdEvent.bind(this));
      this.adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, this._onAdEvent.bind(this));
      this.adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, this._onAdEvent.bind(this));
    }
  }, {
    key: '_onAdEvent',
    value: function _onAdEvent(adEvent) {

      // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
      // don't have ad object associated.
      var ad = adEvent.getAd();
      // let intervalTimer;

      switch (adEvent.type) {
        case google.ima.AdEvent.Type.LOADED:
          // This is the first event sent for an ad - it is possible to
          // determine whether the ad is a video ad or an overlay.
          if (!ad.isLinear()) {
            // Position AdDisplayContainer correctly for overlay.
            // Use ad.width and ad.height.
            this.plyr.play();
          }
          break;
        case google.ima.AdEvent.Type.STARTED:
          // This event indicates the ad has started - the video player
          // can adjust the UI, for example display a pause button and
          // remaining time.
          if (ad.isLinear()) {
            // For a linear ad, a timer can be started to poll for
            // the remaining time.
            // intervalTimer = setInterval(
            //     () => {
            //       let remainingTime = this.adsManager.getRemainingTime();
            //       console.log(remainingTime);
            //     },
            //     300); // every 300ms
          }
          break;
        case google.ima.AdEvent.Type.COMPLETE:
          // This event indicates the ad has finished - the video player
          // can perform appropriate UI actions, such as removing the timer for
          // remaining time detection.
          // clearInterval(intervalTimer);
          break;
      }
    }
  }, {
    key: '_onAdError',
    value: function _onAdError(adErrorEvent) {

      // Handle the error logging.
      this.adsManager.destroy();
      this.adDisplayElement.remove();

      if (this.config.debug) {
        throw new Error(adErrorEvent);
      }
    }
  }, {
    key: '_onContentPauseRequested',
    value: function _onContentPauseRequested() {
      this.plyr.pause();
      // This function is where you should setup UI for showing ads (e.g.
      // display ad timer countdown, disable seeking etc.)
      // setupUIForAds();
    }
  }, {
    key: '_onContentResumeRequested',
    value: function _onContentResumeRequested() {
      this.plyr.play();
      // This function is where you should ensure that your UI is ready
      // to play content. It is the responsibility of the Publisher to
      // implement this function when necessary.
      // setupUIForContent();
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

      // Initialize the ads manager. Ad rules playlist will start at this time.
      this.adsManager.init(container.offsetWidth, container.offsetHeight, google.ima.ViewMode.NORMAL);

      // Call play to start showing the ad. Single video and overlay ads will
      // start at this time; the call will be ignored for ad rules.
      this.adsManager.start();
      // try {

      // } catch (adError) {

      //   // An error may be thrown if there was a problem with the VAST response.
      //   this.plyr.play();
      //   this.adDisplayElement.remove();

      //   if (this.config.debug) {
      //     throw new Error(adError);
      //   }
      // }
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx5ci1hZHMuanMiLCJzb3VyY2VzIjpbInNyYy9qcy9kZWZhdWx0cy5qcyIsInNyYy9qcy9wbHlyLWFkcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbmNvbnN0IGRlZmF1bHRzID0ge1xuICAgIGFkVGFnVXJsOiAnJyxcbiAgICBza2lwQnV0dG9uOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHRleHQ6ICdTa2lwIGFkJyxcbiAgICAgICAgZGVsYXk6IDEwXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0czsiLCJcbmltcG9ydCBkZWZhdWx0cyBmcm9tICcuL2RlZmF1bHRzJztcblxuY2xhc3MgUGx5ckFkcyB7XG5cbiAgY29uc3RydWN0b3IodGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgdGhpcy5jb25maWcgPSB0aGlzLl9tZXJnZWRDb25maWcoZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMuY29uZmlnLnN0YXJ0RXZlbnRzID0gdGhpcy5fZ2V0U3RhcnRFdmVudHMoKTtcbiAgICBcbiAgICB0aGlzLnBseXIgPSB0YXJnZXQ7XG4gICAgdGhpcy5hZERpc3BsYXlDb250YWluZXI7XG4gICAgdGhpcy5hZERpc3BsYXlFbGVtZW50O1xuICAgIHRoaXMuYWRzTWFuYWdlcjtcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcblxuICAgIC8vIENoZWNrIGlmIGEgYWRUYWdVcmwgdXMgcHJvdmlkZWQuXG4gICAgaWYgKCF0aGlzLmNvbmZpZy5hZFRhZ1VybCkgeyB0aHJvdyBuZXcgRXJyb3IoJ05vIGFkVGFnVXJsIHByb3ZpZGVkLicpOyB9XG5cbiAgICAvLyBDaGVjayBpZiB0aGUgR29vZ2xlIElNQTMgU0RLIGlzIGxvYWRlZC5cbiAgICBpZiAoIXdpbmRvdy5nb29nbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdUaGUgR29vZ2xlIElNQTMgU0RLIGlzIG5vdCBsb2FkZWQuJyk7IH1cblxuICAgIC8vIFNldHVwIHRoZSBhZCBkaXNwbGF5IGNvbnRhaW5lci5cbiAgICB0aGlzLl9zZXR1cEFkRGlzcGxheUNvbnRhaW5lcigpO1xuXG4gICAgdGhpcy5fc2V0dXBJTUEoKTtcblxuICAgIC8vIFNldCBsaXN0ZW5lcnMgb24gcGx5ciBtZWRpYSBldmVudHMuXG4gICAgdGhpcy5fc2V0TGlzdGVuZXJzKCk7XG4gIH1cblxuICBfc2V0dXBJTUEoKSB7XG4gICAgLy8gUmVxdWVzdCB2aWRlbyBhZHMuXG4gICAgY29uc3QgYWRzUmVxdWVzdCA9IG5ldyBnb29nbGUuaW1hLkFkc1JlcXVlc3QoKTtcbiAgICBhZHNSZXF1ZXN0LmFkVGFnVXJsID0gdGhpcy5jb25maWcuYWRUYWdVcmw7XG5cbiAgICAvLyBDcmVhdGUgYWRzIGxvYWRlci5cbiAgICB0aGlzLmFkc0xvYWRlciA9IG5ldyBnb29nbGUuaW1hLkFkc0xvYWRlcih0aGlzLmFkRGlzcGxheUNvbnRhaW5lcik7XG5cbiAgICAvLyBMaXN0ZW4gYW5kIHJlc3BvbmQgdG8gYWRzIGxvYWRlZCBhbmQgZXJyb3IgZXZlbnRzLlxuICAgIHRoaXMuYWRzTG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIGdvb2dsZS5pbWEuQWRzTWFuYWdlckxvYWRlZEV2ZW50LlR5cGUuQURTX01BTkFHRVJfTE9BREVELFxuICAgICAgICB0aGlzLl9vbkFkc01hbmFnZXJMb2FkZWQuYmluZCh0aGlzKSxcbiAgICAgICAgZmFsc2UpO1xuICAgIHRoaXMuYWRzTG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIGdvb2dsZS5pbWEuQWRFcnJvckV2ZW50LlR5cGUuQURfRVJST1IsXG4gICAgICAgIHRoaXMuX29uQWRFcnJvci5iaW5kKHRoaXMpLFxuICAgICAgICBmYWxzZSk7XG5cbiAgICAvLyBBbiBldmVudCBsaXN0ZW5lciB0byB0ZWxsIHRoZSBTREsgdGhhdCBvdXIgY29udGVudCB2aWRlb1xuICAgIC8vIGlzIGNvbXBsZXRlZCBzbyB0aGUgU0RLIGNhbiBwbGF5IGFueSBwb3N0LXJvbGwgYWRzLlxuICAgIC8vIGNvbnN0IGNvbnRlbnRFbmRlZExpc3RlbmVyID0gKCkgPT4geyBcbiAgICAvLyAgIHRoaXMuYWRzTG9hZGVyLmNvbnRlbnRDb21wbGV0ZSgpO1xuICAgIC8vIH07XG4gICAgLy8gdmlkZW9Db250ZW50Lm9uZW5kZWQgPSBjb250ZW50RW5kZWRMaXN0ZW5lcjtcblxuICAgIC8vIFNwZWNpZnkgdGhlIGxpbmVhciBhbmQgbm9ubGluZWFyIHNsb3Qgc2l6ZXMuIFRoaXMgaGVscHMgdGhlIFNESyB0b1xuICAgIC8vIHNlbGVjdCB0aGUgY29ycmVjdCBjcmVhdGl2ZSBpZiBtdWx0aXBsZSBhcmUgcmV0dXJuZWQuXG4gICAgYWRzUmVxdWVzdC5saW5lYXJBZFNsb3RXaWR0aCA9IDY0MDtcbiAgICBhZHNSZXF1ZXN0LmxpbmVhckFkU2xvdEhlaWdodCA9IDQwMDtcblxuICAgIGFkc1JlcXVlc3Qubm9uTGluZWFyQWRTbG90V2lkdGggPSA2NDA7XG4gICAgYWRzUmVxdWVzdC5ub25MaW5lYXJBZFNsb3RIZWlnaHQgPSAxNTA7XG5cbiAgICB0aGlzLmFkc0xvYWRlci5yZXF1ZXN0QWRzKGFkc1JlcXVlc3QpO1xuICB9XG5cbiAgX29uQWRzTWFuYWdlckxvYWRlZChhZHNNYW5hZ2VyTG9hZGVkRXZlbnQpIHtcblxuICAgIGNvbnN0IHsgb3JpZ2luYWwgfSA9IHRoaXMucGx5ci5lbGVtZW50cztcblxuICAgIC8vIEdldCB0aGUgYWRzIG1hbmFnZXIuXG4gICAgY29uc3QgYWRzUmVuZGVyaW5nU2V0dGluZ3MgPSBuZXcgZ29vZ2xlLmltYS5BZHNSZW5kZXJpbmdTZXR0aW5ncygpO1xuICAgIGFkc1JlbmRlcmluZ1NldHRpbmdzLnJlc3RvcmVDdXN0b21QbGF5YmFja1N0YXRlT25BZEJyZWFrQ29tcGxldGUgPSB0cnVlO1xuXG4gICAgY29uc3QgY29udGVudFBsYXliYWNrID0ge1xuICAgICAgY3VycmVudFRpbWU6IHRoaXMuY3VycmVudFRpbWUsXG4gICAgICBkdXJhdGlvbjogdGhpcy5wbHlyLmR1cmF0aW9uXG4gICAgfTtcblxuICAgIC8vIHZpZGVvQ29udGVudCBzaG91bGQgYmUgc2V0IHRvIHRoZSBjb250ZW50IHZpZGVvIGVsZW1lbnQuXG4gICAgdGhpcy5hZHNNYW5hZ2VyID0gYWRzTWFuYWdlckxvYWRlZEV2ZW50LmdldEFkc01hbmFnZXIoXG4gICAgICBjb250ZW50UGxheWJhY2ssIGFkc1JlbmRlcmluZ1NldHRpbmdzKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuYWRzTWFuYWdlci5nZXRDdWVQb2ludHMoKSk7XG5cbiAgICAvLyBBZGQgbGlzdGVuZXJzIHRvIHRoZSByZXF1aXJlZCBldmVudHMuXG4gICAgdGhpcy5hZHNNYW5hZ2VyLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIGdvb2dsZS5pbWEuQWRFcnJvckV2ZW50LlR5cGUuQURfRVJST1IsXG4gICAgICAgIHRoaXMuX29uQWRFcnJvci5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmFkc01hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgZ29vZ2xlLmltYS5BZEV2ZW50LlR5cGUuQ09OVEVOVF9QQVVTRV9SRVFVRVNURUQsXG4gICAgICAgIHRoaXMuX29uQ29udGVudFBhdXNlUmVxdWVzdGVkLmJpbmQodGhpcykpO1xuICAgIHRoaXMuYWRzTWFuYWdlci5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICBnb29nbGUuaW1hLkFkRXZlbnQuVHlwZS5DT05URU5UX1JFU1VNRV9SRVFVRVNURUQsXG4gICAgICAgIHRoaXMuX29uQ29udGVudFJlc3VtZVJlcXVlc3RlZC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmFkc01hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgZ29vZ2xlLmltYS5BZEV2ZW50LlR5cGUuQUxMX0FEU19DT01QTEVURUQsXG4gICAgICAgIHRoaXMuX29uQWRFdmVudC5iaW5kKHRoaXMpKTtcblxuICAgIC8vIExpc3RlbiB0byBhbnkgYWRkaXRpb25hbCBldmVudHMsIGlmIG5lY2Vzc2FyeS5cbiAgICB0aGlzLmFkc01hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgZ29vZ2xlLmltYS5BZEV2ZW50LlR5cGUuTE9BREVELFxuICAgICAgICB0aGlzLl9vbkFkRXZlbnQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5hZHNNYW5hZ2VyLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIGdvb2dsZS5pbWEuQWRFdmVudC5UeXBlLlNUQVJURUQsXG4gICAgICAgIHRoaXMuX29uQWRFdmVudC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmFkc01hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgZ29vZ2xlLmltYS5BZEV2ZW50LlR5cGUuQ09NUExFVEUsXG4gICAgICAgIHRoaXMuX29uQWRFdmVudC5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIF9vbkFkRXZlbnQoYWRFdmVudCkge1xuICAgIFxuICAgIC8vIFJldHJpZXZlIHRoZSBhZCBmcm9tIHRoZSBldmVudC4gU29tZSBldmVudHMgKGUuZy4gQUxMX0FEU19DT01QTEVURUQpXG4gICAgLy8gZG9uJ3QgaGF2ZSBhZCBvYmplY3QgYXNzb2NpYXRlZC5cbiAgICBjb25zdCBhZCA9IGFkRXZlbnQuZ2V0QWQoKTtcbiAgICAvLyBsZXQgaW50ZXJ2YWxUaW1lcjtcbiAgICBcbiAgICBzd2l0Y2ggKGFkRXZlbnQudHlwZSkge1xuICAgICAgY2FzZSBnb29nbGUuaW1hLkFkRXZlbnQuVHlwZS5MT0FERUQ6XG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIGZpcnN0IGV2ZW50IHNlbnQgZm9yIGFuIGFkIC0gaXQgaXMgcG9zc2libGUgdG9cbiAgICAgICAgLy8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGFkIGlzIGEgdmlkZW8gYWQgb3IgYW4gb3ZlcmxheS5cbiAgICAgICAgaWYgKCFhZC5pc0xpbmVhcigpKSB7XG4gICAgICAgICAgLy8gUG9zaXRpb24gQWREaXNwbGF5Q29udGFpbmVyIGNvcnJlY3RseSBmb3Igb3ZlcmxheS5cbiAgICAgICAgICAvLyBVc2UgYWQud2lkdGggYW5kIGFkLmhlaWdodC5cbiAgICAgICAgICB0aGlzLnBseXIucGxheSgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBnb29nbGUuaW1hLkFkRXZlbnQuVHlwZS5TVEFSVEVEOlxuICAgICAgICAvLyBUaGlzIGV2ZW50IGluZGljYXRlcyB0aGUgYWQgaGFzIHN0YXJ0ZWQgLSB0aGUgdmlkZW8gcGxheWVyXG4gICAgICAgIC8vIGNhbiBhZGp1c3QgdGhlIFVJLCBmb3IgZXhhbXBsZSBkaXNwbGF5IGEgcGF1c2UgYnV0dG9uIGFuZFxuICAgICAgICAvLyByZW1haW5pbmcgdGltZS5cbiAgICAgICAgaWYgKGFkLmlzTGluZWFyKCkpIHtcbiAgICAgICAgICAvLyBGb3IgYSBsaW5lYXIgYWQsIGEgdGltZXIgY2FuIGJlIHN0YXJ0ZWQgdG8gcG9sbCBmb3JcbiAgICAgICAgICAvLyB0aGUgcmVtYWluaW5nIHRpbWUuXG4gICAgICAgICAgLy8gaW50ZXJ2YWxUaW1lciA9IHNldEludGVydmFsKFxuICAgICAgICAgIC8vICAgICAoKSA9PiB7XG4gICAgICAgICAgLy8gICAgICAgbGV0IHJlbWFpbmluZ1RpbWUgPSB0aGlzLmFkc01hbmFnZXIuZ2V0UmVtYWluaW5nVGltZSgpO1xuICAgICAgICAgIC8vICAgICAgIGNvbnNvbGUubG9nKHJlbWFpbmluZ1RpbWUpO1xuICAgICAgICAgIC8vICAgICB9LFxuICAgICAgICAgIC8vICAgICAzMDApOyAvLyBldmVyeSAzMDBtc1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBnb29nbGUuaW1hLkFkRXZlbnQuVHlwZS5DT01QTEVURTpcbiAgICAgICAgLy8gVGhpcyBldmVudCBpbmRpY2F0ZXMgdGhlIGFkIGhhcyBmaW5pc2hlZCAtIHRoZSB2aWRlbyBwbGF5ZXJcbiAgICAgICAgLy8gY2FuIHBlcmZvcm0gYXBwcm9wcmlhdGUgVUkgYWN0aW9ucywgc3VjaCBhcyByZW1vdmluZyB0aGUgdGltZXIgZm9yXG4gICAgICAgIC8vIHJlbWFpbmluZyB0aW1lIGRldGVjdGlvbi5cbiAgICAgICAgLy8gY2xlYXJJbnRlcnZhbChpbnRlcnZhbFRpbWVyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgX29uQWRFcnJvcihhZEVycm9yRXZlbnQpIHtcbiAgICBcbiAgICAvLyBIYW5kbGUgdGhlIGVycm9yIGxvZ2dpbmcuXG4gICAgdGhpcy5hZHNNYW5hZ2VyLmRlc3Ryb3koKTtcbiAgICB0aGlzLmFkRGlzcGxheUVsZW1lbnQucmVtb3ZlKCk7XG5cbiAgICBpZiAodGhpcy5jb25maWcuZGVidWcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihhZEVycm9yRXZlbnQpO1xuICAgIH1cbiAgfVxuICBcbiAgX29uQ29udGVudFBhdXNlUmVxdWVzdGVkKCkge1xuICAgIHRoaXMucGx5ci5wYXVzZSgpO1xuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgd2hlcmUgeW91IHNob3VsZCBzZXR1cCBVSSBmb3Igc2hvd2luZyBhZHMgKGUuZy5cbiAgICAvLyBkaXNwbGF5IGFkIHRpbWVyIGNvdW50ZG93biwgZGlzYWJsZSBzZWVraW5nIGV0Yy4pXG4gICAgLy8gc2V0dXBVSUZvckFkcygpO1xuICB9XG5cbiAgX29uQ29udGVudFJlc3VtZVJlcXVlc3RlZCgpIHtcbiAgICB0aGlzLnBseXIucGxheSgpO1xuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgd2hlcmUgeW91IHNob3VsZCBlbnN1cmUgdGhhdCB5b3VyIFVJIGlzIHJlYWR5XG4gICAgLy8gdG8gcGxheSBjb250ZW50LiBJdCBpcyB0aGUgcmVzcG9uc2liaWxpdHkgb2YgdGhlIFB1Ymxpc2hlciB0b1xuICAgIC8vIGltcGxlbWVudCB0aGlzIGZ1bmN0aW9uIHdoZW4gbmVjZXNzYXJ5LlxuICAgIC8vIHNldHVwVUlGb3JDb250ZW50KCk7XG4gIH1cblxuICBfc2V0dXBBZERpc3BsYXlDb250YWluZXIoKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIsIG9yaWdpbmFsIH0gPSB0aGlzLnBseXIuZWxlbWVudHM7XG4gICAgXG4gICAgLy8gV2UgYXNzdW1lIHRoZSBhZENvbnRhaW5lciBpcyB0aGUgdmlkZW8gY29udGFpbmVyIG9mIHRoZSBwbHlyIGVsZW1lbnRcbiAgICAvLyB0aGF0IHdpbGwgaG91c2UgdGhlIGFkcy5cbiAgICB0aGlzLmFkRGlzcGxheUNvbnRhaW5lciA9IG5ldyBnb29nbGUuaW1hLkFkRGlzcGxheUNvbnRhaW5lcihcbiAgICAgICAgY29udGFpbmVyLCBvcmlnaW5hbCk7XG5cbiAgICB0aGlzLmFkRGlzcGxheUVsZW1lbnQgPSBjb250YWluZXIuZmlyc3RDaGlsZDtcblxuICAgIC8vIFRoZSBBZERpc3BsYXlDb250YWluZXIgY2FsbCBmcm9tIGdvb2dsZSBpbWEgc2V0cyB0aGUgc3R5bGUgYXR0cmlidXRlXG4gICAgLy8gYnkgZGVmYXVsdC4gV2UgcmVtb3ZlIHRoZSBpbmxpbmUgc3R5bGUgYW5kIHNldCBpdCB0aHJvdWdoIHRoZSBzdHlsZXNoZWV0LlxuICAgIHRoaXMuYWREaXNwbGF5RWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XG4gICAgXG4gICAgLy8gU2V0IGNsYXNzIG5hbWUgb24gdGhlIGFkRGlzcGxheUNvbnRhaW5lciBlbGVtZW50LlxuICAgIHRoaXMuYWREaXNwbGF5RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ3BseXItYWRzJyk7XG5cbiAgICAvLyBQbGF5IGFkcyB3aGVuIGNsaWNrZWQuXG4gICAgdGhpcy5fc2V0T25DbGlja0hhbmRsZXIodGhpcy5hZERpc3BsYXlFbGVtZW50LCB0aGlzLl9wbGF5QWRzKTtcbiAgfVxuXG4gIF9wbGF5QWRzKCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyIH0gPSB0aGlzLnBseXIuZWxlbWVudHM7XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSBjb250YWluZXIuIE11c3QgYmUgZG9uZSB2aWEgYSB1c2VyIGFjdGlvbiBvbiBtb2JpbGUgZGV2aWNlcy5cbiAgICB0aGlzLmFkRGlzcGxheUNvbnRhaW5lci5pbml0aWFsaXplKCk7XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSBhZHMgbWFuYWdlci4gQWQgcnVsZXMgcGxheWxpc3Qgd2lsbCBzdGFydCBhdCB0aGlzIHRpbWUuXG4gICAgdGhpcy5hZHNNYW5hZ2VyLmluaXQoXG4gICAgICBjb250YWluZXIub2Zmc2V0V2lkdGgsXG4gICAgICBjb250YWluZXIub2Zmc2V0SGVpZ2h0LFxuICAgICAgZ29vZ2xlLmltYS5WaWV3TW9kZS5OT1JNQUxcbiAgICApO1xuXG4gICAgLy8gQ2FsbCBwbGF5IHRvIHN0YXJ0IHNob3dpbmcgdGhlIGFkLiBTaW5nbGUgdmlkZW8gYW5kIG92ZXJsYXkgYWRzIHdpbGxcbiAgICAvLyBzdGFydCBhdCB0aGlzIHRpbWU7IHRoZSBjYWxsIHdpbGwgYmUgaWdub3JlZCBmb3IgYWQgcnVsZXMuXG4gICAgdGhpcy5hZHNNYW5hZ2VyLnN0YXJ0KCk7XG4gICAgLy8gdHJ5IHtcbiAgICBcbiAgICAvLyB9IGNhdGNoIChhZEVycm9yKSB7XG5cbiAgICAvLyAgIC8vIEFuIGVycm9yIG1heSBiZSB0aHJvd24gaWYgdGhlcmUgd2FzIGEgcHJvYmxlbSB3aXRoIHRoZSBWQVNUIHJlc3BvbnNlLlxuICAgIC8vICAgdGhpcy5wbHlyLnBsYXkoKTtcbiAgICAvLyAgIHRoaXMuYWREaXNwbGF5RWxlbWVudC5yZW1vdmUoKTtcblxuICAgIC8vICAgaWYgKHRoaXMuY29uZmlnLmRlYnVnKSB7XG4gICAgLy8gICAgIHRocm93IG5ldyBFcnJvcihhZEVycm9yKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9XG4gIH1cblxuICAvLyBTZXQncyBhIGNsaWNrIGV2ZW50IGxpc3RlbmVyIG9uIGEgRE9NIGVsZW1lbnQgYW5kIHRyaWdnZXJzIHRoZVxuICAvLyBjYWxsYmFjayB3aGVuIGNsaWNrZWQuIFxuICBfc2V0T25DbGlja0hhbmRsZXIoZWxlbWVudCwgY2FsbGJhY2spIHtcbiAgICBmb3IgKGxldCBzdGFydEV2ZW50IG9mIHRoaXMuY29uZmlnLnN0YXJ0RXZlbnRzKSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoc3RhcnRFdmVudCwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC50eXBlID09PSAndG91Y2hlbmQnICYmXG4gICAgICAgICAgICBzdGFydEV2ZW50ID09PSAndG91Y2hzdGFydCcgfHxcbiAgICAgICAgICAgIGV2ZW50LnR5cGUgPT09ICdjbGljaycpIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9LCB7b25jZTogdHJ1ZX0pO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gTWVyZ2UgZGVmYXVsdHMgYW5kIG9wdGlvbnMuXG4gIF9tZXJnZWRDb25maWcoZGVmYXVsdHMsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gey4uLmRlZmF1bHRzLCAuLi5vcHRpb25zfTtcbiAgfVxuXG4gIF9zZXRMaXN0ZW5lcnMoKSB7XG5cbiAgICBsZXQgdGltZSA9IDA7XG5cbiAgICAvLyB0aW1ldXBkYXRlXG4gICAgdGhpcy5wbHlyLm9uKCd0aW1ldXBkYXRlJywgKGV2ZW50KSA9PiB7XG4gICAgICBjb25zdCB7IGN1cnJlbnRUaW1lIH0gPSBldmVudC5kZXRhaWwucGx5cjtcblxuICAgICAgaWYgKHRpbWUgIT09IE1hdGguY2VpbChjdXJyZW50VGltZSkpIHtcbiAgICAgICAgc3dpdGNoKHRpbWUpIHtcbiAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgY29uc29sZS5sb2coJzE1Jyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc29sZS5sb2codGltZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgdGltZSA9IE1hdGguY2VpbChjdXJyZW50VGltZSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBTZXQgdGhlIGNvcnJlY3QgZXZlbnQsIGJhc2VkIG9uIHVzZXJBZ2VudC5cbiAgX2dldFN0YXJ0RXZlbnRzKCkge1xuICAgIGxldCBzdGFydEV2ZW50cyA9IFsnY2xpY2snXTtcbiAgICBcbiAgICAvLyBGb3IgbW9iaWxlIHVzZXJzIHRoZSBzdGFydCBldmVudCB3aWxsIGJlIG9uZSBvZlxuICAgIC8vIHRvdWNoc3RhcnQsIHRvdWNoZW5kIGFuZCB0b3VjaG1vdmUuXG4gICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2lQaG9uZS9pKSB8fFxuICAgICAgICBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9pUGFkL2kpIHx8XG4gICAgICAgIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0FuZHJvaWQvaSkpIHtcbiAgICAgICAgc3RhcnRFdmVudHMgPSBbJ3RvdWNoc3RhcnQnLCAndG91Y2hlbmQnLCAndG91Y2htb3ZlJ107XG4gICAgfVxuICAgIHJldHVybiBzdGFydEV2ZW50cztcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGluaXQ6ICh0YXJnZXQsIG9wdGlvbnMpID0+IG5ldyBQbHlyQWRzKHRhcmdldCwgb3B0aW9ucylcbn07XG4iXSwibmFtZXMiOlsiZGVmYXVsdHMiLCJQbHlyQWRzIiwidGFyZ2V0Iiwib3B0aW9ucyIsImNvbmZpZyIsIl9tZXJnZWRDb25maWciLCJzdGFydEV2ZW50cyIsIl9nZXRTdGFydEV2ZW50cyIsInBseXIiLCJhZERpc3BsYXlDb250YWluZXIiLCJhZERpc3BsYXlFbGVtZW50IiwiYWRzTWFuYWdlciIsImN1cnJlbnRUaW1lIiwiYWRUYWdVcmwiLCJFcnJvciIsIndpbmRvdyIsImdvb2dsZSIsIl9zZXR1cEFkRGlzcGxheUNvbnRhaW5lciIsIl9zZXR1cElNQSIsIl9zZXRMaXN0ZW5lcnMiLCJhZHNSZXF1ZXN0IiwiaW1hIiwiQWRzUmVxdWVzdCIsImFkc0xvYWRlciIsIkFkc0xvYWRlciIsImFkZEV2ZW50TGlzdGVuZXIiLCJBZHNNYW5hZ2VyTG9hZGVkRXZlbnQiLCJUeXBlIiwiQURTX01BTkFHRVJfTE9BREVEIiwiX29uQWRzTWFuYWdlckxvYWRlZCIsImJpbmQiLCJBZEVycm9yRXZlbnQiLCJBRF9FUlJPUiIsIl9vbkFkRXJyb3IiLCJsaW5lYXJBZFNsb3RXaWR0aCIsImxpbmVhckFkU2xvdEhlaWdodCIsIm5vbkxpbmVhckFkU2xvdFdpZHRoIiwibm9uTGluZWFyQWRTbG90SGVpZ2h0IiwicmVxdWVzdEFkcyIsImFkc01hbmFnZXJMb2FkZWRFdmVudCIsImFkc1JlbmRlcmluZ1NldHRpbmdzIiwiQWRzUmVuZGVyaW5nU2V0dGluZ3MiLCJyZXN0b3JlQ3VzdG9tUGxheWJhY2tTdGF0ZU9uQWRCcmVha0NvbXBsZXRlIiwiY29udGVudFBsYXliYWNrIiwiZHVyYXRpb24iLCJnZXRBZHNNYW5hZ2VyIiwiQWRFdmVudCIsIkNPTlRFTlRfUEFVU0VfUkVRVUVTVEVEIiwiX29uQ29udGVudFBhdXNlUmVxdWVzdGVkIiwiQ09OVEVOVF9SRVNVTUVfUkVRVUVTVEVEIiwiX29uQ29udGVudFJlc3VtZVJlcXVlc3RlZCIsIkFMTF9BRFNfQ09NUExFVEVEIiwiX29uQWRFdmVudCIsIkxPQURFRCIsIlNUQVJURUQiLCJDT01QTEVURSIsImFkRXZlbnQiLCJhZCIsImdldEFkIiwidHlwZSIsImlzTGluZWFyIiwicGxheSIsImFkRXJyb3JFdmVudCIsImRlc3Ryb3kiLCJyZW1vdmUiLCJkZWJ1ZyIsInBhdXNlIiwiZWxlbWVudHMiLCJjb250YWluZXIiLCJvcmlnaW5hbCIsIkFkRGlzcGxheUNvbnRhaW5lciIsImZpcnN0Q2hpbGQiLCJyZW1vdmVBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJfc2V0T25DbGlja0hhbmRsZXIiLCJfcGxheUFkcyIsImluaXRpYWxpemUiLCJpbml0Iiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRIZWlnaHQiLCJWaWV3TW9kZSIsIk5PUk1BTCIsInN0YXJ0IiwiZWxlbWVudCIsImNhbGxiYWNrIiwic3RhcnRFdmVudCIsImV2ZW50IiwiY2FsbCIsIm9uY2UiLCJ0aW1lIiwib24iLCJkZXRhaWwiLCJNYXRoIiwi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
