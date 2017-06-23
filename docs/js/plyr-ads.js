'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaults = {
  container: 'plyr-ads',
  adTagUrl: '',
  type: '',
  skipButton: {
    enabled: true,
    text: 'Skip ad',
    delay: 10
  }
};

var PlyrAds = function () {
  function PlyrAds(plyrInstance, config) {
    var _this = this;

    _classCallCheck(this, PlyrAds);

    this.plyrInstance = plyrInstance;
    this.plyrContainer = plyrInstance.getContainer();
    this.adDisplayContainer;
    this.config = config;

    // Initialize
    this.init = function () {
      if (_this.config.type === 'ima' && !window.google) {
        throw new Error('You\'ve specified PlyrAds for type \'ima\' but the Google IMA SDK is not loaded.');
      }

      // Create the ad display container.
      _this._createAdDisplayContainer();

      // Create the ad skip button.
      _this._createAdSkipButton();

      // Set advertisments.
      if (_this.config.type === 'ima') {
        _this._setUpIMA();
      }

      // Bind click event to adDisplayContainer.
      _this._bindEventToAdDisplayContainer();
    };

    this._createAdDisplayContainer = function () {
      switch (_this.config.type) {
        case 'ima':
          _this.adDisplayContainer = new window.google.ima.AdDisplayContainer(_this.plyrContainer);
          _this.adDisplayContainer.I.setAttribute('class', 'plyr-ads');
          break;
        case 'youtube':
          _this.adDisplayContainer = _insertElement('div', _this.plyrContainer, {
            class: _this.config.container
          });
          break;
        default:
          break;
      }
    };

    this._createAdSkipButton = function () {
      var container = _this.adDisplayContainer;

      if (_this.config.type === 'ima') {
        container = container.I;
      }
    };

    this._bindEventToAdDisplayContainer = function () {
      var container = _this.adDisplayContainer;

      if (_this.config.type === 'ima') {
        container = container.I;
      }

      container.addEventListener(_getStartEvent(), function () {
        _this._playAds();
      }, false);
    };

    this._setUpIMA = function () {

      // Create ads loader.
      _this.adsLoader = new window.google.ima.AdsLoader(_this.adDisplayContainer);

      // Listen and respond to ads loaded and error events.
      _this.adsLoader.addEventListener(window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, function (e) {
        _this._onAdsManagerLoaded(e);
      }, false);
      _this.adsLoader.addEventListener(window.google.ima.AdErrorEvent.Type.AD_ERROR, function () {
        _this._playVideo();
      }, false);

      // Request video ads.
      var adsRequest = new window.google.ima.AdsRequest();
      adsRequest.adTagUrl = _this.config.adTagUrl;
      _this.adsLoader.requestAds(adsRequest);
    };

    this._onAdsManagerLoaded = function (adsManagerLoadedEvent) {

      // Get the ads manager.
      var adsRenderingSettings = new window.google.ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
      _this.adsManager = adsManagerLoadedEvent.getAdsManager(adsRenderingSettings);

      // Add listeners to the required events.
      _this.adsManager.addEventListener(window.google.ima.AdErrorEvent.Type.AD_ERROR, function (e) {
        _this._onAdError(e);
      });
      _this.adsManager.addEventListener(window.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, function (e) {
        _this._onContentResumeRequested(e);
      });
      _this.adsManager.addEventListener(window.google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED, function (e) {
        _this._onContentSkippable(e);
      });
      _this.adsManager.addEventListener(window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED, function (e) {
        _this._onAdEvent(e);
      });

      // Listen to any additional events, if necessary.
      _this.adsManager.addEventListener(window.google.ima.AdEvent.Type.LOADED, function (e) {
        _this._onAdEvent(e);
      });
      _this.adsManager.addEventListener(window.google.ima.AdEvent.Type.STARTED, function (e) {
        _this._onAdEvent(e);
      });
      _this.adsManager.addEventListener(window.google.ima.AdEvent.Type.PAUSED, function (e) {
        _this._onAdEvent(e);
      });
      _this.adsManager.addEventListener(window.google.ima.AdEvent.Type.RESUMED, function (e) {
        _this._onAdEvent(e);
      });
      _this.adsManager.addEventListener(window.google.ima.AdEvent.Type.COMPLETE, function (e) {
        _this._onAdEvent(e);
      });

      // Listen to the resizing of the window. And resize
      // ad accordingly.
      window.addEventListener('resize', function () {
        _this.adsManager.resize(_this.plyrContainer.offsetWidth, _this.plyrContainer.offsetHeight, window.google.ima.ViewMode.NORMAL);
      });
    };

    this._onAdEvent = function (adEvent) {
      // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
      // don't have ad object associated.
      var ad = adEvent.getAd();
      switch (adEvent.type) {
        case window.google.ima.AdEvent.Type.LOADED:
          // This is the first event sent for an ad - it is possible to
          // determine whether the ad is a video ad or an overlay.
          if (!ad.isLinear()) {
            // Position AdDisplayContainer correctly for overlay.
            // Use ad.width and ad.height.
            _this.playVideo();
          }
          break;
        case window.google.ima.AdEvent.Type.STARTED:
          // This event indicates the ad has started - the video player
          // can adjust the UI, for example display a pause button and
          // remaining time.
          if (ad.isLinear()) {
            // For a linear ad, a timer can be started to poll for
            // the remaining time.
            if (ad.g.duration > 15) {
              // Add ad skip button to DOM.
              _this.createAdSkipButton();
            }
          }
          break;
        case window.google.ima.AdEvent.Type.PAUSED:
          // This event indicates the ad has started - the video player
          // can adjust the UI, for example display a pause button and
          // remaining time.
          if (ad.isLinear()) {
            // For a linear ad, a timer can be started to poll for
            // the remaining time.
            _this.adPaused = true;
          }
          break;
        case window.google.ima.AdEvent.Type.RESUMED:
          // This event indicates the ad has started - the video player
          // can adjust the UI, for example display a pause button and
          // remaining time.
          if (ad.isLinear()) {
            // For a linear ad, a timer can be started to poll for
            // the remaining time.
            _this.adPaused = false;
          }
          break;
        case window.google.ima.AdEvent.Type.COMPLETE:
          // This event indicates the ad has finished - the video player
          // can perform appropriate UI actions, such as removing the timer for
          // remaining time detection.

          // Start playing the video.
          _this.playVideo();
          break;
        default:
          break;
      }
    };

    this.onAdError = function (adErrorEvent) {

      // Handle the error logging.
      _this.adsManager.destroy();
      _this._playVideo();
      throw new Error(adErrorEvent.getError());
    };

    this._onContentResumeRequested = function () {

      // Start playing the video.
      _this._playVideo();
    };

    this._playAds = function () {
      switch (_this.config.type) {
        case 'ima':
          // Initialize the container. Must be done via a user action on mobile devices.
          _this.adDisplayContainer.initialize();

          // Initialize the ads manager. Ad rules playlist will start at this time.
          _this.adsManager.init(_this.plyrContainer.offsetWidth, _this.plyrContainer.offsetHeight, window.google.ima.ViewMode.NORMAL);

          // Call play to start showing the ad. Single video and overlay ads will
          // start at this time; the call will be ignored for ad rules.
          _this.adsManager.start();
          break;
        case 'youtube':
          // Call play to start showing the ad.
          _this.adsManager.play();

          // Start playing video after the youtube preroll has ended.
          _this.adsManager.instance.on('ended', function () {
            _this._playVideo();
          });
          break;
        default:
          break;
      }
    };

    this.__ = function () {
      _this.adSkipButton.style.display = 'block';
    };

    this._playVideo = function () {
      if (_this.skipAdButton) {
        _this.skipAdButton.remove();
      }
      _this.adDisplayContainer.destroy();

      if (_this.plyr.getType() === 'youtube' && navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/Android/i)) {
        // Due to restrictions in some mobile devices, functions and parameters
        // such as autoplay, playVideo(), loadVideoById() won't work in all
        // mobile environments.
        _this.plyr.getEmbed().playVideoAt(0);
      } else {
        _this.plyr.play();
      }
    };
  }

  _createClass(PlyrAds, null, [{
    key: 'setup',
    value: function setup(plyrInstances, config) {
      var plyrAdInstances = [];

      // Wrap single instances in an Array so we can loop it. 
      if (!plyrInstances.length) {
        plyrInstances = [plyrInstances];
      }

      plyrInstances.forEach(function (instance) {
        var plyrAdInstance = new PlyrAds(instance, Object.assign({}, defaults, config));

        // Push new PlyrAds instance so we can return the instances.
        plyrAdInstances.push(plyrAdInstance);

        // Initialize the new instance.
        plyrAdInstance.init();
      });
      return plyrAdInstances;
    }
  }]);

  return PlyrAds;
}();

/////////////////////////////////
// Utils
/////////////////////////////////

// Check variable types.


var _is = {
  object: function object(input) {
    return input !== null && (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object';
  },
  array: function array(input) {
    return input !== null && (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object' && input.constructor === Array;
  },
  number: function number(input) {
    return input !== null && (typeof input === 'number' && !isNaN(input - 0) || (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object' && input.constructor === Number);
  },
  string: function string(input) {
    return input !== null && (typeof input === 'string' || (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object' && input.constructor === String);
  },
  boolean: function boolean(input) {
    return input !== null && typeof input === 'boolean';
  },
  nodeList: function nodeList(input) {
    return input !== null && input instanceof NodeList;
  },
  htmlElement: function htmlElement(input) {
    return input !== null && input instanceof HTMLElement;
  },
  function: function _function(input) {
    return input !== null && typeof input === 'function';
  },
  undefined: function undefined(input) {
    return input !== null && typeof input === 'undefined';
  }
};

// Prepend child
function _prependChild(parent, element) {
  return parent.insertBefore(element, parent.firstChild);
}

// Set attributes
function _setAttributes(element, attributes) {
  for (var key in attributes) {
    if (Object.prototype.hasOwnProperty.call(attributes, key)) {
      element.setAttribute(key, _is.boolean(attributes[key]) && attributes[key] ? '' : attributes[key]);
    }
  }
}

// Insert a HTML element
function _insertElement(type, parent, attributes) {
  // Create a new <element>
  var element = document.createElement(type);

  // Set all passed attributes
  _setAttributes(element, attributes);

  // Inject the new element
  return _prependChild(parent, element);
}

// Get the correct event based on userAgent.
function _getStartEvent() {
  var startEvent = 'click';

  if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/Android/i)) {
    startEvent = 'touchstart';
  }
  return startEvent;
}