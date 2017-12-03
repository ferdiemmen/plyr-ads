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
      var original = this.plyr.elements.original;

      // Get the ads manager.

      var adsRenderingSettings = new google.ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

      // videoContent should be set to the content video element.
      this.adsManager = adsManagerLoadedEvent.getAdsManager(original, adsRenderingSettings);

      console.log(this.adsManager);

      console.log(this.adsManager.getCuePoints());

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
      var _this = this;

      // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
      // don't have ad object associated.
      var ad = adEvent.getAd();
      var intervalTimer = void 0;

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
            intervalTimer = setInterval(function () {
              var remainingTime = _this.adsManager.getRemainingTime();
              console.log(remainingTime);
            }, 300); // every 300ms
          }
          break;
        case google.ima.AdEvent.Type.COMPLETE:
          // This event indicates the ad has finished - the video player
          // can perform appropriate UI actions, such as removing the timer for
          // remaining time detection.
          clearInterval(intervalTimer);
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


      try {
        // Initialize the container. Must be done via a user action on mobile devices.
        this.adDisplayContainer.initialize();

        // Initialize the ads manager. Ad rules playlist will start at this time.
        this.adsManager.init(container.offsetWidth, container.offsetHeight, google.ima.ViewMode.NORMAL);

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
      var _this2 = this;

      var _loop = function _loop(startEvent) {
        element.addEventListener(startEvent, function (event) {
          if (event.type === 'touchend' && startEvent === 'touchstart' || event.type === 'click') {
            callback.call(_this2);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx5ci1hZHMuanMiLCJzb3VyY2VzIjpbInNyYy9qcy9kZWZhdWx0cy5qcyIsInNyYy9qcy9wbHlyLWFkcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbmNvbnN0IGRlZmF1bHRzID0ge1xuICAgIGFkVGFnVXJsOiAnJyxcbiAgICBza2lwQnV0dG9uOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHRleHQ6ICdTa2lwIGFkJyxcbiAgICAgICAgZGVsYXk6IDEwXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0czsiLCJcbmltcG9ydCBkZWZhdWx0cyBmcm9tICcuL2RlZmF1bHRzJztcblxuY2xhc3MgUGx5ckFkcyB7XG5cbiAgY29uc3RydWN0b3IodGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgdGhpcy5jb25maWcgPSB0aGlzLl9tZXJnZWRDb25maWcoZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMuY29uZmlnLnN0YXJ0RXZlbnRzID0gdGhpcy5fZ2V0U3RhcnRFdmVudHMoKTtcbiAgICBcbiAgICB0aGlzLnBseXIgPSB0YXJnZXQ7XG4gICAgdGhpcy5hZERpc3BsYXlDb250YWluZXI7XG4gICAgdGhpcy5hZERpc3BsYXlFbGVtZW50O1xuICAgIHRoaXMuYWRzTWFuYWdlcjtcblxuICAgIC8vIENoZWNrIGlmIGEgYWRUYWdVcmwgdXMgcHJvdmlkZWQuXG4gICAgaWYgKCF0aGlzLmNvbmZpZy5hZFRhZ1VybCkgeyB0aHJvdyBuZXcgRXJyb3IoJ05vIGFkVGFnVXJsIHByb3ZpZGVkLicpOyB9XG5cbiAgICAvLyBDaGVjayBpZiB0aGUgR29vZ2xlIElNQTMgU0RLIGlzIGxvYWRlZC5cbiAgICBpZiAoIXdpbmRvdy5nb29nbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdUaGUgR29vZ2xlIElNQTMgU0RLIGlzIG5vdCBsb2FkZWQuJyk7IH1cblxuICAgIC8vIFNldHVwIHRoZSBhZCBkaXNwbGF5IGNvbnRhaW5lci5cbiAgICB0aGlzLl9zZXR1cEFkRGlzcGxheUNvbnRhaW5lcigpO1xuXG4gICAgdGhpcy5fc2V0dXBJTUEoKTtcblxuICAgIC8vIFNldCBsaXN0ZW5lcnMgb24gcGx5ciBtZWRpYSBldmVudHMuXG4gICAgdGhpcy5fc2V0TGlzdGVuZXJzKCk7XG4gIH1cblxuICBfc2V0dXBJTUEoKSB7XG4gICAgLy8gUmVxdWVzdCB2aWRlbyBhZHMuXG4gICAgY29uc3QgYWRzUmVxdWVzdCA9IG5ldyBnb29nbGUuaW1hLkFkc1JlcXVlc3QoKTtcbiAgICBhZHNSZXF1ZXN0LmFkVGFnVXJsID0gdGhpcy5jb25maWcuYWRUYWdVcmw7XG5cbiAgICAvLyBDcmVhdGUgYWRzIGxvYWRlci5cbiAgICB0aGlzLmFkc0xvYWRlciA9IG5ldyBnb29nbGUuaW1hLkFkc0xvYWRlcih0aGlzLmFkRGlzcGxheUNvbnRhaW5lcik7XG5cbiAgICAvLyBMaXN0ZW4gYW5kIHJlc3BvbmQgdG8gYWRzIGxvYWRlZCBhbmQgZXJyb3IgZXZlbnRzLlxuICAgIHRoaXMuYWRzTG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIGdvb2dsZS5pbWEuQWRzTWFuYWdlckxvYWRlZEV2ZW50LlR5cGUuQURTX01BTkFHRVJfTE9BREVELFxuICAgICAgICB0aGlzLl9vbkFkc01hbmFnZXJMb2FkZWQuYmluZCh0aGlzKSxcbiAgICAgICAgZmFsc2UpO1xuICAgIHRoaXMuYWRzTG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIGdvb2dsZS5pbWEuQWRFcnJvckV2ZW50LlR5cGUuQURfRVJST1IsXG4gICAgICAgIHRoaXMuX29uQWRFcnJvci5iaW5kKHRoaXMpLFxuICAgICAgICBmYWxzZSk7XG5cbiAgICAvLyBBbiBldmVudCBsaXN0ZW5lciB0byB0ZWxsIHRoZSBTREsgdGhhdCBvdXIgY29udGVudCB2aWRlb1xuICAgIC8vIGlzIGNvbXBsZXRlZCBzbyB0aGUgU0RLIGNhbiBwbGF5IGFueSBwb3N0LXJvbGwgYWRzLlxuICAgIC8vIGNvbnN0IGNvbnRlbnRFbmRlZExpc3RlbmVyID0gKCkgPT4geyBcbiAgICAvLyAgIHRoaXMuYWRzTG9hZGVyLmNvbnRlbnRDb21wbGV0ZSgpO1xuICAgIC8vIH07XG4gICAgLy8gdmlkZW9Db250ZW50Lm9uZW5kZWQgPSBjb250ZW50RW5kZWRMaXN0ZW5lcjtcblxuICAgIC8vIFNwZWNpZnkgdGhlIGxpbmVhciBhbmQgbm9ubGluZWFyIHNsb3Qgc2l6ZXMuIFRoaXMgaGVscHMgdGhlIFNESyB0b1xuICAgIC8vIHNlbGVjdCB0aGUgY29ycmVjdCBjcmVhdGl2ZSBpZiBtdWx0aXBsZSBhcmUgcmV0dXJuZWQuXG4gICAgYWRzUmVxdWVzdC5saW5lYXJBZFNsb3RXaWR0aCA9IDY0MDtcbiAgICBhZHNSZXF1ZXN0LmxpbmVhckFkU2xvdEhlaWdodCA9IDQwMDtcblxuICAgIGFkc1JlcXVlc3Qubm9uTGluZWFyQWRTbG90V2lkdGggPSA2NDA7XG4gICAgYWRzUmVxdWVzdC5ub25MaW5lYXJBZFNsb3RIZWlnaHQgPSAxNTA7XG5cbiAgICB0aGlzLmFkc0xvYWRlci5yZXF1ZXN0QWRzKGFkc1JlcXVlc3QpO1xuICB9XG5cbiAgX29uQWRzTWFuYWdlckxvYWRlZChhZHNNYW5hZ2VyTG9hZGVkRXZlbnQpIHtcblxuICAgIGNvbnN0IHsgb3JpZ2luYWwgfSA9IHRoaXMucGx5ci5lbGVtZW50cztcblxuICAgIC8vIEdldCB0aGUgYWRzIG1hbmFnZXIuXG4gICAgY29uc3QgYWRzUmVuZGVyaW5nU2V0dGluZ3MgPSBuZXcgZ29vZ2xlLmltYS5BZHNSZW5kZXJpbmdTZXR0aW5ncygpO1xuICAgIGFkc1JlbmRlcmluZ1NldHRpbmdzLnJlc3RvcmVDdXN0b21QbGF5YmFja1N0YXRlT25BZEJyZWFrQ29tcGxldGUgPSB0cnVlO1xuXG4gICAgLy8gdmlkZW9Db250ZW50IHNob3VsZCBiZSBzZXQgdG8gdGhlIGNvbnRlbnQgdmlkZW8gZWxlbWVudC5cbiAgICB0aGlzLmFkc01hbmFnZXIgPSBhZHNNYW5hZ2VyTG9hZGVkRXZlbnQuZ2V0QWRzTWFuYWdlcihcbiAgICAgIG9yaWdpbmFsLCBhZHNSZW5kZXJpbmdTZXR0aW5ncyk7XG5cbiAgICBjb25zb2xlLmxvZyh0aGlzLmFkc01hbmFnZXIpO1xuXG4gICAgY29uc29sZS5sb2codGhpcy5hZHNNYW5hZ2VyLmdldEN1ZVBvaW50cygpKTtcblxuICAgIC8vIEFkZCBsaXN0ZW5lcnMgdG8gdGhlIHJlcXVpcmVkIGV2ZW50cy5cbiAgICB0aGlzLmFkc01hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgZ29vZ2xlLmltYS5BZEVycm9yRXZlbnQuVHlwZS5BRF9FUlJPUixcbiAgICAgICAgdGhpcy5fb25BZEVycm9yLmJpbmQodGhpcykpO1xuICAgIHRoaXMuYWRzTWFuYWdlci5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICBnb29nbGUuaW1hLkFkRXZlbnQuVHlwZS5DT05URU5UX1BBVVNFX1JFUVVFU1RFRCxcbiAgICAgICAgdGhpcy5fb25Db250ZW50UGF1c2VSZXF1ZXN0ZWQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5hZHNNYW5hZ2VyLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIGdvb2dsZS5pbWEuQWRFdmVudC5UeXBlLkNPTlRFTlRfUkVTVU1FX1JFUVVFU1RFRCxcbiAgICAgICAgdGhpcy5fb25Db250ZW50UmVzdW1lUmVxdWVzdGVkLmJpbmQodGhpcykpO1xuICAgIHRoaXMuYWRzTWFuYWdlci5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICBnb29nbGUuaW1hLkFkRXZlbnQuVHlwZS5BTExfQURTX0NPTVBMRVRFRCxcbiAgICAgICAgdGhpcy5fb25BZEV2ZW50LmJpbmQodGhpcykpO1xuXG4gICAgLy8gTGlzdGVuIHRvIGFueSBhZGRpdGlvbmFsIGV2ZW50cywgaWYgbmVjZXNzYXJ5LlxuICAgIHRoaXMuYWRzTWFuYWdlci5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICBnb29nbGUuaW1hLkFkRXZlbnQuVHlwZS5MT0FERUQsXG4gICAgICAgIHRoaXMuX29uQWRFdmVudC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmFkc01hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgZ29vZ2xlLmltYS5BZEV2ZW50LlR5cGUuU1RBUlRFRCxcbiAgICAgICAgdGhpcy5fb25BZEV2ZW50LmJpbmQodGhpcykpO1xuICAgIHRoaXMuYWRzTWFuYWdlci5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICBnb29nbGUuaW1hLkFkRXZlbnQuVHlwZS5DT01QTEVURSxcbiAgICAgICAgdGhpcy5fb25BZEV2ZW50LmJpbmQodGhpcykpO1xuICB9XG5cbiAgX29uQWRFdmVudChhZEV2ZW50KSB7XG4gICAgXG4gICAgLy8gUmV0cmlldmUgdGhlIGFkIGZyb20gdGhlIGV2ZW50LiBTb21lIGV2ZW50cyAoZS5nLiBBTExfQURTX0NPTVBMRVRFRClcbiAgICAvLyBkb24ndCBoYXZlIGFkIG9iamVjdCBhc3NvY2lhdGVkLlxuICAgIGNvbnN0IGFkID0gYWRFdmVudC5nZXRBZCgpO1xuICAgIGxldCBpbnRlcnZhbFRpbWVyO1xuICAgIFxuICAgIHN3aXRjaCAoYWRFdmVudC50eXBlKSB7XG4gICAgICBjYXNlIGdvb2dsZS5pbWEuQWRFdmVudC5UeXBlLkxPQURFRDpcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZmlyc3QgZXZlbnQgc2VudCBmb3IgYW4gYWQgLSBpdCBpcyBwb3NzaWJsZSB0b1xuICAgICAgICAvLyBkZXRlcm1pbmUgd2hldGhlciB0aGUgYWQgaXMgYSB2aWRlbyBhZCBvciBhbiBvdmVybGF5LlxuICAgICAgICBpZiAoIWFkLmlzTGluZWFyKCkpIHtcbiAgICAgICAgICAvLyBQb3NpdGlvbiBBZERpc3BsYXlDb250YWluZXIgY29ycmVjdGx5IGZvciBvdmVybGF5LlxuICAgICAgICAgIC8vIFVzZSBhZC53aWR0aCBhbmQgYWQuaGVpZ2h0LlxuICAgICAgICAgIHRoaXMucGx5ci5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGdvb2dsZS5pbWEuQWRFdmVudC5UeXBlLlNUQVJURUQ6XG4gICAgICAgIC8vIFRoaXMgZXZlbnQgaW5kaWNhdGVzIHRoZSBhZCBoYXMgc3RhcnRlZCAtIHRoZSB2aWRlbyBwbGF5ZXJcbiAgICAgICAgLy8gY2FuIGFkanVzdCB0aGUgVUksIGZvciBleGFtcGxlIGRpc3BsYXkgYSBwYXVzZSBidXR0b24gYW5kXG4gICAgICAgIC8vIHJlbWFpbmluZyB0aW1lLlxuICAgICAgICBpZiAoYWQuaXNMaW5lYXIoKSkge1xuICAgICAgICAgIC8vIEZvciBhIGxpbmVhciBhZCwgYSB0aW1lciBjYW4gYmUgc3RhcnRlZCB0byBwb2xsIGZvclxuICAgICAgICAgIC8vIHRoZSByZW1haW5pbmcgdGltZS5cbiAgICAgICAgICBpbnRlcnZhbFRpbWVyID0gc2V0SW50ZXJ2YWwoXG4gICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgcmVtYWluaW5nVGltZSA9IHRoaXMuYWRzTWFuYWdlci5nZXRSZW1haW5pbmdUaW1lKCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVtYWluaW5nVGltZSk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIDMwMCk7IC8vIGV2ZXJ5IDMwMG1zXG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGdvb2dsZS5pbWEuQWRFdmVudC5UeXBlLkNPTVBMRVRFOlxuICAgICAgICAvLyBUaGlzIGV2ZW50IGluZGljYXRlcyB0aGUgYWQgaGFzIGZpbmlzaGVkIC0gdGhlIHZpZGVvIHBsYXllclxuICAgICAgICAvLyBjYW4gcGVyZm9ybSBhcHByb3ByaWF0ZSBVSSBhY3Rpb25zLCBzdWNoIGFzIHJlbW92aW5nIHRoZSB0aW1lciBmb3JcbiAgICAgICAgLy8gcmVtYWluaW5nIHRpbWUgZGV0ZWN0aW9uLlxuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsVGltZXIpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBfb25BZEVycm9yKGFkRXJyb3JFdmVudCkge1xuICAgIFxuICAgIC8vIEhhbmRsZSB0aGUgZXJyb3IgbG9nZ2luZy5cbiAgICB0aGlzLmFkc01hbmFnZXIuZGVzdHJveSgpO1xuICAgIHRoaXMuYWREaXNwbGF5RWxlbWVudC5yZW1vdmUoKTtcblxuICAgIGlmICh0aGlzLmNvbmZpZy5kZWJ1Zykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGFkRXJyb3JFdmVudCk7XG4gICAgfVxuICB9XG4gIFxuICBfb25Db250ZW50UGF1c2VSZXF1ZXN0ZWQoKSB7XG4gICAgdGhpcy5wbHlyLnBhdXNlKCk7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyB3aGVyZSB5b3Ugc2hvdWxkIHNldHVwIFVJIGZvciBzaG93aW5nIGFkcyAoZS5nLlxuICAgIC8vIGRpc3BsYXkgYWQgdGltZXIgY291bnRkb3duLCBkaXNhYmxlIHNlZWtpbmcgZXRjLilcbiAgICAvLyBzZXR1cFVJRm9yQWRzKCk7XG4gIH1cblxuICBfb25Db250ZW50UmVzdW1lUmVxdWVzdGVkKCkge1xuICAgIHRoaXMucGx5ci5wbGF5KCk7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyB3aGVyZSB5b3Ugc2hvdWxkIGVuc3VyZSB0aGF0IHlvdXIgVUkgaXMgcmVhZHlcbiAgICAvLyB0byBwbGF5IGNvbnRlbnQuIEl0IGlzIHRoZSByZXNwb25zaWJpbGl0eSBvZiB0aGUgUHVibGlzaGVyIHRvXG4gICAgLy8gaW1wbGVtZW50IHRoaXMgZnVuY3Rpb24gd2hlbiBuZWNlc3NhcnkuXG4gICAgLy8gc2V0dXBVSUZvckNvbnRlbnQoKTtcbiAgfVxuXG4gIF9zZXR1cEFkRGlzcGxheUNvbnRhaW5lcigpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciwgb3JpZ2luYWwgfSA9IHRoaXMucGx5ci5lbGVtZW50cztcbiAgICBcbiAgICAvLyBXZSBhc3N1bWUgdGhlIGFkQ29udGFpbmVyIGlzIHRoZSB2aWRlbyBjb250YWluZXIgb2YgdGhlIHBseXIgZWxlbWVudFxuICAgIC8vIHRoYXQgd2lsbCBob3VzZSB0aGUgYWRzLlxuICAgIHRoaXMuYWREaXNwbGF5Q29udGFpbmVyID0gbmV3IGdvb2dsZS5pbWEuQWREaXNwbGF5Q29udGFpbmVyKFxuICAgICAgICBjb250YWluZXIsIG9yaWdpbmFsKTtcblxuICAgIHRoaXMuYWREaXNwbGF5RWxlbWVudCA9IGNvbnRhaW5lci5maXJzdENoaWxkO1xuXG4gICAgLy8gVGhlIEFkRGlzcGxheUNvbnRhaW5lciBjYWxsIGZyb20gZ29vZ2xlIGltYSBzZXRzIHRoZSBzdHlsZSBhdHRyaWJ1dGVcbiAgICAvLyBieSBkZWZhdWx0LiBXZSByZW1vdmUgdGhlIGlubGluZSBzdHlsZSBhbmQgc2V0IGl0IHRocm91Z2ggdGhlIHN0eWxlc2hlZXQuXG4gICAgdGhpcy5hZERpc3BsYXlFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcbiAgICBcbiAgICAvLyBTZXQgY2xhc3MgbmFtZSBvbiB0aGUgYWREaXNwbGF5Q29udGFpbmVyIGVsZW1lbnQuXG4gICAgdGhpcy5hZERpc3BsYXlFbGVtZW50LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAncGx5ci1hZHMnKTtcblxuICAgIC8vIFBsYXkgYWRzIHdoZW4gY2xpY2tlZC5cbiAgICB0aGlzLl9zZXRPbkNsaWNrSGFuZGxlcih0aGlzLmFkRGlzcGxheUVsZW1lbnQsIHRoaXMuX3BsYXlBZHMpO1xuICB9XG5cbiAgX3BsYXlBZHMoKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIgfSA9IHRoaXMucGx5ci5lbGVtZW50cztcblxuICAgIHRyeSB7XG4gICAgICAvLyBJbml0aWFsaXplIHRoZSBjb250YWluZXIuIE11c3QgYmUgZG9uZSB2aWEgYSB1c2VyIGFjdGlvbiBvbiBtb2JpbGUgZGV2aWNlcy5cbiAgICAgIHRoaXMuYWREaXNwbGF5Q29udGFpbmVyLmluaXRpYWxpemUoKTtcbiAgXG4gICAgICAvLyBJbml0aWFsaXplIHRoZSBhZHMgbWFuYWdlci4gQWQgcnVsZXMgcGxheWxpc3Qgd2lsbCBzdGFydCBhdCB0aGlzIHRpbWUuXG4gICAgICB0aGlzLmFkc01hbmFnZXIuaW5pdChcbiAgICAgICAgY29udGFpbmVyLm9mZnNldFdpZHRoLFxuICAgICAgICBjb250YWluZXIub2Zmc2V0SGVpZ2h0LFxuICAgICAgICBnb29nbGUuaW1hLlZpZXdNb2RlLk5PUk1BTFxuICAgICAgKTtcblxuICAgICAgLy8gQ2FsbCBwbGF5IHRvIHN0YXJ0IHNob3dpbmcgdGhlIGFkLiBTaW5nbGUgdmlkZW8gYW5kIG92ZXJsYXkgYWRzIHdpbGxcbiAgICAgIC8vIHN0YXJ0IGF0IHRoaXMgdGltZTsgdGhlIGNhbGwgd2lsbCBiZSBpZ25vcmVkIGZvciBhZCBydWxlcy5cbiAgICAgIHRoaXMuYWRzTWFuYWdlci5zdGFydCgpO1xuICAgIFxuICAgIH0gY2F0Y2ggKGFkRXJyb3IpIHtcblxuICAgICAgLy8gQW4gZXJyb3IgbWF5IGJlIHRocm93biBpZiB0aGVyZSB3YXMgYSBwcm9ibGVtIHdpdGggdGhlIFZBU1QgcmVzcG9uc2UuXG4gICAgICB0aGlzLnBseXIucGxheSgpO1xuICAgICAgdGhpcy5hZERpc3BsYXlFbGVtZW50LnJlbW92ZSgpO1xuXG4gICAgICBpZiAodGhpcy5jb25maWcuZGVidWcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGFkRXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFNldCdzIGEgY2xpY2sgZXZlbnQgbGlzdGVuZXIgb24gYSBET00gZWxlbWVudCBhbmQgdHJpZ2dlcnMgdGhlXG4gIC8vIGNhbGxiYWNrIHdoZW4gY2xpY2tlZC4gXG4gIF9zZXRPbkNsaWNrSGFuZGxlcihlbGVtZW50LCBjYWxsYmFjaykge1xuICAgIGZvciAobGV0IHN0YXJ0RXZlbnQgb2YgdGhpcy5jb25maWcuc3RhcnRFdmVudHMpIHtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihzdGFydEV2ZW50LCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICd0b3VjaGVuZCcgJiZcbiAgICAgICAgICAgIHN0YXJ0RXZlbnQgPT09ICd0b3VjaHN0YXJ0JyB8fFxuICAgICAgICAgICAgZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH0sIHtvbmNlOiB0cnVlfSk7XG4gICAgfVxuICB9XG5cblxuICAvLyBNZXJnZSBkZWZhdWx0cyBhbmQgb3B0aW9ucy5cbiAgX21lcmdlZENvbmZpZyhkZWZhdWx0cywgb3B0aW9ucykge1xuICAgIHJldHVybiB7Li4uZGVmYXVsdHMsIC4uLm9wdGlvbnN9O1xuICB9XG5cbiAgX3NldExpc3RlbmVycygpIHtcblxuICAgIGxldCB0aW1lID0gMDtcblxuICAgIC8vIHRpbWV1cGRhdGVcbiAgICB0aGlzLnBseXIub24oJ3RpbWV1cGRhdGUnLCAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHsgY3VycmVudFRpbWUgfSA9IGV2ZW50LmRldGFpbC5wbHlyO1xuXG4gICAgICBpZiAodGltZSAhPT0gTWF0aC5jZWlsKGN1cnJlbnRUaW1lKSkge1xuICAgICAgICBzd2l0Y2godGltZSkge1xuICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnMTUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICB0aW1lID0gTWF0aC5jZWlsKGN1cnJlbnRUaW1lKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFNldCB0aGUgY29ycmVjdCBldmVudCwgYmFzZWQgb24gdXNlckFnZW50LlxuICBfZ2V0U3RhcnRFdmVudHMoKSB7XG4gICAgbGV0IHN0YXJ0RXZlbnRzID0gWydjbGljayddO1xuICAgIFxuICAgIC8vIEZvciBtb2JpbGUgdXNlcnMgdGhlIHN0YXJ0IGV2ZW50IHdpbGwgYmUgb25lIG9mXG4gICAgLy8gdG91Y2hzdGFydCwgdG91Y2hlbmQgYW5kIHRvdWNobW92ZS5cbiAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvaVBob25lL2kpIHx8XG4gICAgICAgIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2lQYWQvaSkgfHxcbiAgICAgICAgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvQW5kcm9pZC9pKSkge1xuICAgICAgICBzdGFydEV2ZW50cyA9IFsndG91Y2hzdGFydCcsICd0b3VjaGVuZCcsICd0b3VjaG1vdmUnXTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXJ0RXZlbnRzO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgaW5pdDogKHRhcmdldCwgb3B0aW9ucykgPT4gbmV3IFBseXJBZHModGFyZ2V0LCBvcHRpb25zKVxufTtcbiJdLCJuYW1lcyI6WyJkZWZhdWx0cyIsIlBseXJBZHMiLCJ0YXJnZXQiLCJvcHRpb25zIiwiY29uZmlnIiwiX21lcmdlZENvbmZpZyIsInN0YXJ0RXZlbnRzIiwiX2dldFN0YXJ0RXZlbnRzIiwicGx5ciIsImFkRGlzcGxheUNvbnRhaW5lciIsImFkRGlzcGxheUVsZW1lbnQiLCJhZHNNYW5hZ2VyIiwiYWRUYWdVcmwiLCJFcnJvciIsIndpbmRvdyIsImdvb2dsZSIsIl9zZXR1cEFkRGlzcGxheUNvbnRhaW5lciIsIl9zZXR1cElNQSIsIl9zZXRMaXN0ZW5lcnMiLCJhZHNSZXF1ZXN0IiwiaW1hIiwiQWRzUmVxdWVzdCIsImFkc0xvYWRlciIsIkFkc0xvYWRlciIsImFkZEV2ZW50TGlzdGVuZXIiLCJBZHNNYW5hZ2VyTG9hZGVkRXZlbnQiLCJUeXBlIiwiQURTX01BTkFHRVJfTE9BREVEIiwiX29uQWRzTWFuYWdlckxvYWRlZCIsImJpbmQiLCJBZEVycm9yRXZlbnQiLCJBRF9FUlJPUiIsIl9vbkFkRXJyb3IiLCJsaW5lYXJBZFNsb3RXaWR0aCIsImxpbmVhckFkU2xvdEhlaWdodCIsIm5vbkxpbmVhckFkU2xvdFdpZHRoIiwibm9uTGluZWFyQWRTbG90SGVpZ2h0IiwicmVxdWVzdEFkcyIsImFkc01hbmFnZXJMb2FkZWRFdmVudCIsIm9yaWdpbmFsIiwiZWxlbWVudHMiLCJhZHNSZW5kZXJpbmdTZXR0aW5ncyIsIkFkc1JlbmRlcmluZ1NldHRpbmdzIiwicmVzdG9yZUN1c3RvbVBsYXliYWNrU3RhdGVPbkFkQnJlYWtDb21wbGV0ZSIsImdldEFkc01hbmFnZXIiLCJsb2ciLCJnZXRDdWVQb2ludHMiLCJBZEV2ZW50IiwiQ09OVEVOVF9QQVVTRV9SRVFVRVNURUQiLCJfb25Db250ZW50UGF1c2VSZXF1ZXN0ZWQiLCJDT05URU5UX1JFU1VNRV9SRVFVRVNURUQiLCJfb25Db250ZW50UmVzdW1lUmVxdWVzdGVkIiwiQUxMX0FEU19DT01QTEVURUQiLCJfb25BZEV2ZW50IiwiTE9BREVEIiwiU1RBUlRFRCIsIkNPTVBMRVRFIiwiYWRFdmVudCIsImFkIiwiZ2V0QWQiLCJpbnRlcnZhbFRpbWVyIiwidHlwZSIsImlzTGluZWFyIiwicGxheSIsInNldEludGVydmFsIiwicmVtYWluaW5nVGltZSIsImdldFJlbWFpbmluZ1RpbWUiLCJhZEVycm9yRXZlbnQiLCJkZXN0cm95IiwicmVtb3ZlIiwiZGVidWciLCJwYXVzZSIsImNvbnRhaW5lciIsIkFkRGlzcGxheUNvbnRhaW5lciIsImZpcnN0Q2hpbGQiLCJyZW1vdmVBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJfc2V0T25DbGlja0hhbmRsZXIiLCJfcGxheUFkcyIsImluaXRpYWxpemUiLCJpbml0Iiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRIZWlnaHQiLCJWaWV3TW9kZSIsIk5PUk1BTCIsInN0YXJ0IiwiYWRFcnJvciIsImVsZW1lbnQiLCJjYWxsYmFjayIsInN0YXJ0RXZlbnQiLCJldmVudCIsImNhbGwiLCJvbmNlIiwidGltZSIsIm9uIiwiY3VycmVudFRpbWUiLCJkZXRhaWwiLCJNYXRoIiwiY2VpbCIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsIm1hdGNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxJQUFNQSxXQUFXO2NB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
