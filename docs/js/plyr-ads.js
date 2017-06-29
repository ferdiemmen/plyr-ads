  /* global define,module */

// ==========================================================================
// Plyr-Ads
// plyr-ads.js v1.1.0
// https://github.com/ferdiemmen/plyr-ads
// License: The MIT License (MIT)
// ==========================================================================
// Credits: Copyright 2013 Google Inc. All Rights Reserved.
//          You may study, modify, and use this example for any purpose.
//          Note that this example is provided "as is", WITHOUT WARRANTY
//          of any kind either expressed or implied.
// ==========================================================================


(function (root, factory) {

  'use strict';

  if (typeof module === 'object' && typeof module.exports === 'object') {
    // Node, CommonJS-like
    module.exports = factory(root, document);
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function() {
      return factory(root, document);
    });
  } else {
    // Browser globals (root is window)
    root.plyrAds = factory(root, document);
  }
}(typeof window !== 'undefined' ? window : this, function (window, document) {
  'use strict';

  // Default config
  let defaults = {
    adTagUrl: '',
    skipButton: {
      enabled: true,
      text: 'Skip ad',
      delay: 10
    }
  };

  // Check variable types.
  let _is = {
    object: function (input) {
      return input !== null && typeof (input) === 'object';
    },
    array: function (input) {
      return input !== null && (typeof (input) === 'object' && input.constructor === Array);
    },
    number: function (input) {
      return input !== null && (typeof (input) === 'number' && !isNaN(input - 0) || (typeof input === 'object' && input.constructor === Number));
    },
    string: function (input) {
      return input !== null && (typeof input === 'string' || (typeof input === 'object' && input.constructor === String));
    },
    boolean: function (input) {
      return input !== null && typeof input === 'boolean';
    },
    nodeList: function (input) {
      return input !== null && input instanceof NodeList;
    },
    htmlElement: function (input) {
      return input !== null && input instanceof HTMLElement;
    },
    function: function (input) {
      return input !== null && typeof input === 'function';
    },
    undefined: function (input) {
      return input !== null && typeof input === 'undefined';
    }
  };

  function PlyrAds(plyr, options) {
    this.adsManager;
    this.adsLoader;
    this.adDuration;
    this.intervalTimer;
    this.plyr = plyr;
    this.options = options;
    this.plyrContainer = plyr.getContainer();
    this.adPaused = false;
    this.skipAdButton;
    this.adDisplayContainer;

    // Check if the Google IMA3 SDK is present.
    if (!window.google) {
      throw new Error('The Google IMA3 SDK is not loaded.');
    }

    this.init = () => {
      // Add ad container to DOM.
      this.createAdDisplayContainer();

      // Setup IMA.
      this.setUpIMA();
    };

    this.playAds = () => {

      // Initialize the container. Must be done via a user action on mobile devices.
      this.adDisplayContainer.initialize();

      // Initialize the ads manager. Ad rules playlist will start at this time.
      this.adsManager.init(this.plyrContainer.offsetWidth, this.plyrContainer.offsetHeight, window.google.ima.ViewMode.NORMAL);

      // Call play to start showing the ad. Single video and overlay ads will
      // start at this time; the call will be ignored for ad rules.
      this.adsManager.start();
    };

    this.playVideo = () => {
      if (this.skipAdButton) {
        this.skipAdButton.remove();
      }
      this.adDisplayContainer.I.remove();

      if (this.plyr.getType() === 'youtube' &&
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/Android/i)) {
        // Due to this restriction, functions and parameters such as autoplay,
        // playVideo(), loadVideoById() won't work in all mobile environments.
        this.plyr.getEmbed().playVideoAt(0);
      } else {
        this.plyr.play();
      }
    };

    return {
      init: this.init
    };
  }

  PlyrAds.prototype.setUpIMA = _setUpIMA;
  PlyrAds.prototype.createAdDisplayContainer = _createAdDisplayContainer;
  PlyrAds.prototype.createAdSkipButton = _createAdSkipButton;
  PlyrAds.prototype.onAdEvent = _onAdEvent;
  PlyrAds.prototype.onAdError = _onAdError;
  PlyrAds.prototype.onAdsManagerLoaded = _onAdsManagerLoaded;
  PlyrAds.prototype.onContentResumeRequested = _onContentResumeRequested;
  PlyrAds.prototype.onContentSkippable = _onContentSkippable;
  PlyrAds.prototype.toggleListener = _toggleListener;

  function _createAdDisplayContainer() {
    this.adDisplayContainer = new window.google.ima.AdDisplayContainer(
      this.plyr.getContainer());
    this.adDisplayContainer.I.setAttribute('class', 'plyr-ads');

    // Set listener on ad display container to play the ad.
    this.toggleListener(this.adDisplayContainer.I, this.playAds);
  }

  function _createAdSkipButton() {
    let skipTimer = this.options.skipButton.delay;

    this.skipAdButton = _insertElement('button', this.plyrContainer, {
      class: 'plyr-ads__skip-button'
    });
    this.skipAdButton.innerHTML = 'You can skip to video in ' + (skipTimer--);

    let skipButtonTimer = window.setInterval(function waitForAd() {
      if (!this.adPaused) {
        this.skipAdButton.innerHTML = 'You can skip to video in ' + skipTimer--;
      }
      if ((skipTimer + 1) === 0) {
        this.skipAdButton.className += ' done';
        this.skipAdButton.innerHTML = this.options.skipButton.text;

        // Set listener on ad skip button to skip the ad.
        this.toggleListener(this.skipAdButton, this.playVideo);

        window.clearInterval(skipButtonTimer);
      }
    }.bind(this), 1000);
  }

  // Prepend child
  function _prependChild(parent, element) {
    return parent.insertBefore(element, parent.firstChild);
  }

  // Set attributes
  function _setAttributes(element, attributes) {
    for (let key in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, key)) {
        element.setAttribute(key, (_is.boolean(attributes[key]) && attributes[key]) ? '' : attributes[key]);
      }
    }
  }

  // Insert a HTML element
  function _insertElement(type, parent, attributes) {
    // Create a new <element>
    let element = document.createElement(type);

    // Set all passed attributes
    _setAttributes(element, attributes);

    // Inject the new element
    return _prependChild(parent, element);
  }

  function _setUpIMA() {
    // Create ads loader.
    this.adsLoader = new window.google.ima.AdsLoader(this.adDisplayContainer);
    // Listen and respond to ads loaded and error events.
    this.adsLoader.addEventListener(
      window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      function (e) {
        this.onAdsManagerLoaded(e);
      }.bind(this),
      false);
    this.adsLoader.addEventListener(
      window.google.ima.AdErrorEvent.Type.AD_ERROR,
      function() {
        this.playVideo();
      }.bind(this),
      false);

    // Request video ads.
    let adsRequest = new window.google.ima.AdsRequest();
    adsRequest.adTagUrl = this.options.adTagUrl;
    this.adsLoader.requestAds(adsRequest);
  }

  function _onAdsManagerLoaded(adsManagerLoadedEvent) {
    // Get the ads manager.
    let adsRenderingSettings = new window.google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
    this.adsManager = adsManagerLoadedEvent.getAdsManager(adsRenderingSettings);

    // Add listeners to the required events.
    this.adsManager.addEventListener(
      window.google.ima.AdErrorEvent.Type.AD_ERROR,
      function (e) {
        this.onAdError(e);
      }.bind(this));
    this.adsManager.addEventListener(
      window.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      function (e) {
        this.onContentResumeRequested(e);
      }.bind(this));
    this.adsManager.addEventListener(
      window.google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED,
      function (e) {
        this.onContentSkippable(e);
      }.bind(this));
    this.adsManager.addEventListener(
      window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      function (e) {
        this.onAdEvent(e);
      }.bind(this));

    // Listen to any additional events, if necessary.
    this.adsManager.addEventListener(
      window.google.ima.AdEvent.Type.LOADED,
      function (e) {
        this.onAdEvent(e);
      }.bind(this));
    this.adsManager.addEventListener(
      window.google.ima.AdEvent.Type.STARTED,
      function (e) {
        this.onAdEvent(e);
      }.bind(this));
    this.adsManager.addEventListener(
      window.google.ima.AdEvent.Type.PAUSED,
      function (e) {
        this.onAdEvent(e);
      }.bind(this));
    this.adsManager.addEventListener(
      window.google.ima.AdEvent.Type.RESUMED,
      function (e) {
        this.onAdEvent(e);
      }.bind(this));
    this.adsManager.addEventListener(
      window.google.ima.AdEvent.Type.COMPLETE,
      function (e) {
        this.onAdEvent(e);
      }.bind(this));

    // Listen to the resizing of the window. And resize
    // ad accordingly.
    window.addEventListener(
      'resize',
      function() {
        this.adsManager.resize(
          this.plyrContainer.offsetWidth,
          this.plyrContainer.offsetHeight,
          window.google.ima.ViewMode.NORMAL);
      }.bind(this));
  }

  function _onAdEvent(adEvent) {
    // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
    // don't have ad object associated.
    let ad = adEvent.getAd();
    switch (adEvent.type) {
      case window.google.ima.AdEvent.Type.LOADED:
        // This is the first event sent for an ad - it is possible to
        // determine whether the ad is a video ad or an overlay.
        if (!ad.isLinear()) {
          // Position AdDisplayContainer correctly for overlay.
          // Use ad.width and ad.height.
          this.playVideo();
        }
        break;
      case window.google.ima.AdEvent.Type.STARTED:
        // This event indicates the ad has started - the video player
        // can adjust the UI, for example display a pause button and
        // remaining time.
        if (ad.isLinear()) {
          // For a linear ad, a timer can be started to poll for
          // the remaining time.
          // this.intervalTimer = setInterval(
          //     function() {
          //         let remainingTime = Math.round(this.adsManager.getRemainingTime());
          //     }.bind(this),
          //     300); // every 300ms
          if (ad.g.duration > 15) {
            // Add ad skip button to DOM.
            this.createAdSkipButton();
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
          this.adPaused = true;
        }
        break;
      case window.google.ima.AdEvent.Type.RESUMED:
        // This event indicates the ad has started - the video player
        // can adjust the UI, for example display a pause button and
        // remaining time.
        if (ad.isLinear()) {
          // For a linear ad, a timer can be started to poll for
          // the remaining time.
          this.adPaused = false;
        }
        break;
      case window.google.ima.AdEvent.Type.COMPLETE:
        // This event indicates the ad has finished - the video player
        // can perform appropriate UI actions, such as removing the timer for
        // remaining time detection.

        // Start playing the video.
        this.playVideo();

        if (ad.isLinear()) {
          clearInterval(this.intervalTimer);
        }
        break;
      default:
        break;
    }
  }

  function _onAdError(adErrorEvent) {
    // Handle the error logging.
    this.adsManager.destroy();
    this.playVideo();
    throw new Error(adErrorEvent.getError());
  }

  function _onContentResumeRequested() {
    // Start playing the video.
    this.playVideo();
    // This function is where you should ensure that your UI is ready
    // to play content. It is the responsibility of the Publisher to
    // implement this function when necessary.
    // setupUIForContent();
  }

  function _onContentSkippable() {
    this.plyrAdSkipButton.style.display = 'block';
  }

  // Deep extend/merge destination object with N more objects
  // http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
  // Removed call to arguments.callee (used explicit function name instead)
  function _extend() {
    // Get arguments
    let objects = arguments;

    // Bail if nothing to merge
    if (!objects.length) {
      return;
    }

    // Return first if specified but nothing to merge
    if (objects.length === 1) {
      return objects[0];
    }

    // First object is the destination
    let destination = Array.prototype.shift.call(objects);
    let length = objects.length;

    // Loop through all objects to merge
    for (let i = 0; i < length; i++) {
      let source = objects[i];

      for (let property in source) {
        if (source[property] && source[property].constructor && source[property].constructor === Object) {
          destination[property] = destination[property] || {};
          _extend(destination[property], source[property]);
        } else {
          destination[property] = source[property];
        }
      }
    }

    return destination;
  }

  function _toggleListener(element, cb) {
    let startEvent;
    for (let touchEvent of _getEvents()) {
      element.addEventListener(touchEvent, function(event) {
        if (event.type === 'touchend' && startEvent === 'touchstart' || event.type === 'click') {
          cb();
        }
        startEvent = event.type;
      }, false);
    }
  }

  function _getEvents() {
    // Set the correct event based on userAgent.
    let startEvent = ['click'];
    if (navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/Android/i)) {
      startEvent = ['touchstart', 'touchend', 'touchmove'];
    }
    return startEvent;
  }


  // Setup function
  function setup(plyr, config) {
    // Bail if plyr instances aren't found.
    if (!window.plyr || !plyr) return false;

    // Set options from defaults and config.
    let options = _extend({}, defaults, config);

    // Loop through plyr instances and add ads.
    plyr.forEach(function (instance) {
      // Only add ads to video instances.
      if (instance.getType() !== 'audio') {
        let newInstance = new PlyrAds(instance, options);
        newInstance.init();
      }
    });

    return false;
  }

  return {
    setup: setup
  };

}));
