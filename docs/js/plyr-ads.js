'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
    this.adPaused = false;
    this.config = config;

    // Initialize
    this.init = function () {
      if (_this.config.type === 'ima' && !window.google) {
        throw new Error('You\'ve specified PlyrAds for type \'ima\' but the Google IMA SDK is not loaded.');
      }

      // Create the ad display container.
      _this._createAdDisplayContainer[_this.config.type].call(_this);

      // Set advertisments.
      _this._setUpAds[_this.config.type].call(_this);

      // Bind click event to adDisplayContainer.
      _this._bindEventToAdDisplayContainer();
    };

    this._createAdDisplayContainer = {
      ima: function ima() {
        _this.adDisplayContainer = new window.google.ima.AdDisplayContainer(_this.plyrContainer);
        _this.adDisplayContainer.I.setAttribute('class', 'plyr-ads');
      },
      youtube: function youtube() {
        _this.adDisplayContainer = _insertElement('div', _this.plyrContainer, {
          class: _this.config.container
        });
      }
    };

    this._createAdSkipButton = function () {
      var skipTimer = _this.config.skipButton.delay;

      _this.adSkipButton = _insertElement('button', _this.plyrContainer, {
        class: 'plyr-ads__skip-button'
      });
      _this.adSkipButton.innerHTML = 'You can skip to video in ' + skipTimer--;

      var skipButtonTimer = window.setInterval(function () {
        if (!_this.adPaused) {
          _this.adSkipButton.innerHTML = 'You can skip to video in ' + skipTimer--;
        }
        if (skipTimer + 1 === 0) {
          _this.adSkipButton.className += ' done';
          _this.adSkipButton.innerHTML = _this.config.skipButton.text;
          _this.adSkipButton.addEventListener(_getStartEvent(), function () {
            _this._playVideo();
          }, false);
          window.clearInterval(skipButtonTimer);
        }
      }, 1000);
    };

    this._bindEventToAdDisplayContainer = function () {

      // Bind click (touchstart on mobile) to adDisplayContainer.
      var container = _this.config.type === 'ima' ? _this.adDisplayContainer.I : _this.adDisplayContainer;

      container.addEventListener(_getStartEvent(), function () {
        _this._playAds();
      }, false);
    };

    this._setUpAds = {
      ima: function ima() {
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
      },
      youtube: function youtube() {
        _this.adDisplayContainer.classList.add('plyr-ads__youtube');
        _this.adDisplayContainer.setAttribute('data-type', 'youtube');
        _this.adDisplayContainer.setAttribute('data-video-id', 't6QHnrrNIKA');

        _this.adsManager = window.plyr.setup(_this.adDisplayContainer, {
          controls: []
        });

        _this.adsManager[0].on('ready', function (e) {
          e.detail.plyr.getContainer().getElementsByClassName('plyr__controls')[0].remove();
        });
      }
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
            _this._playVideo();
          }
          break;
        case window.google.ima.AdEvent.Type.STARTED:
          // This event indicates the ad has started - the video player
          // can adjust the UI, for example display a pause button and
          // remaining time.
          if (ad.isLinear()) {
            // For a linear ad, a timer can be started to poll for
            // the remaining time.
            if (ad.getDuration() > _this.config.skipButton.delay) {
              // Add ad skip button to DOM.
              _this._createAdSkipButton();
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
          _this._playVideo();
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
          _this.adDisplayContainer.style.visibility = 'visible';

          // Call play to start showing the ad.
          if (_this.config.type === 'youtube' && navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/Android/i)) {
            // Due to restrictions in some mobile devices, functions and parameters
            // such as autoplay, playVideo(), loadVideoById() won't work in all
            // mobile environments.
            _this.adsManager.getEmbed().playVideoAt(0);
          } else {}
          // this.adsManager.play();


          // Start playing video after the youtube preroll has ended.
          // this.adsManager[0].on('ended', () => {
          //   this._playVideo();
          // });
          break;
        default:
          break;
      }
    };

    this._onContentSkippable = function () {
      // Display the ad skip button.
      _this.adSkipButton.style.display = 'block';
    };

    this._playVideo = function () {
      // Remove ad skip button.
      if (_this.adSkipButton) {
        _this.adSkipButton.remove();
      }

      // Remove ad overlay.
      var container = _this.config.type === 'ima' ? _this.adDisplayContainer.I : _this.adDisplayContainer;
      container.remove();

      if (_this.config.type === 'youtube' && navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/Android/i)) {
        // Due to restrictions in some mobile devices, functions and parameters
        // such as autoplay, playVideo(), loadVideoById() won't work in all
        // mobile environments.
        _this.plyrInstance.getEmbed().playVideoAt(0);
      } else {
        _this.plyrInstance.play();
      }
    };

    return {
      init: this.init
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
        var plyrAdInstance = new PlyrAds(instance, _extend({}, defaults, config));

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

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function _isObject(item) {
  return item && (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function _extend(target) {
  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  if (!sources.length) return target;
  var source = sources.shift();

  if (_isObject(target) && _isObject(source)) {
    for (var key in source) {
      if (_isObject(source[key])) {
        if (!target[key]) Object.assign(target, _defineProperty({}, key, {}));
        _extend(target[key], source[key]);
      } else {
        Object.assign(target, _defineProperty({}, key, source[key]));
      }
    }
  }

  return _extend.apply(undefined, [target].concat(sources));
}
//# sourceMappingURL=plyr-ads.js.map
