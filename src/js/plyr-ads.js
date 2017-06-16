// ==========================================================================
// Plyr-Ads
// plyr-ads.js v0.0.2
// https://github.com/ferdiemmen/plyr-ads
// License: The MIT License (MIT)
// ==========================================================================
// Credits: Google Inc.
// ==========================================================================

;(function(root, factory) {
    'use strict';
    /*global define,module*/

    if (typeof module === 'object' && typeof module.exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(root, document);
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define([], function () { return factory(root, document); });
    } else {
        // Browser globals (root is window)
        root.plyrAds = factory(root, document);
    }
}(typeof window !== 'undefined' ? window : this, function(window, document) {
  'use strict';

  // Copyright 2013 Google Inc. All Rights Reserved.
  // You may study, modify, and use this example for any purpose.
  // Note that this example is provided "as is", WITHOUT WARRANTY
  // of any kind either expressed or implied.

  // Check variable types
  const _is = {
      object: function(input) {
          return input !== null && typeof(input) === 'object';
      },
      array: function(input) {
          return input !== null && (typeof(input) === 'object' && input.constructor === Array);
      },
      number: function(input) {
          return input !== null && (typeof(input) === 'number' && !isNaN(input - 0) || (typeof input === 'object' && input.constructor === Number));
      },
      string: function(input) {
          return input !== null && (typeof input === 'string' || (typeof input === 'object' && input.constructor === String));
      },
      boolean: function(input) {
          return input !== null && typeof input === 'boolean';
      },
      nodeList: function(input) {
          return input !== null && input instanceof NodeList;
      },
      htmlElement: function(input) {
          return input !== null && input instanceof HTMLElement;
      },
      function: function(input) {
          return input !== null && typeof input === 'function';
      },
      undefined: function(input) {
          return input !== null && typeof input === 'undefined';
      }
  };

  function PlyrAds(plyr, config) {
    this.adsManager;
    this.adsLoader;
    this.intervalTimer;
    this.plyr = plyr;
    this.plyrContainer = plyr.getContainer();
    this.adDisplayContainer;

    // Check if the Google IMA3 SDK is present. 
    if (!window.google) {
        return false;
    }

    // Add ad overlay to DOM.
    this.plyrAdContainer = _setupAds(plyr);

    // Setup IMA.
    this.setUpIMA();

    // Bind click event to ad overlay.
    this.plyrAdContainer.addEventListener('click', function() {
        this.playAds();
    }.bind(this), false);
  }

  PlyrAds.prototype.playAds = _playAds;
  PlyrAds.prototype.setUpIMA = _setUpIMA;
  PlyrAds.prototype.createAdDisplayContainer = _createAdDisplayContainer;
  PlyrAds.prototype.onAdEvent = _onAdEvent;
  PlyrAds.prototype.onAdError = _onAdError;
  PlyrAds.prototype.onAdsManagerLoaded = _onAdsManagerLoaded;
  PlyrAds.prototype.onContentResumeRequested = _onContentResumeRequested;

  function _setupAds(player) {
      let type = 'div';
      let attributes = {
          class: 'plyr-ads',
          style: 'position: absolute;top: 0;left: 0;right: 0;bottom: 0;width: 100% !important;height: 100% !important;z-index: 10;overflow: hidden;'
      }
      return _insertElement(type, player.getContainer(), attributes);
  }

  // Prepend child
  function _prependChild(parent, element) {
      return parent.insertBefore(element, parent.firstChild);
  }

  // Set attributes
  function _setAttributes(element, attributes) {
      for (let key in attributes) {
          element.setAttribute(key, (_is.boolean(attributes[key]) && attributes[key]) ? '' : attributes[key]);
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
    // Create the ad display container.
    this.createAdDisplayContainer();
    // Create ads loader.
    this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);
    // Listen and respond to ads loaded and error events.
    this.adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        function(e) {
          this.onAdsManagerLoaded(e);
        }.bind(this),
        false);
    this.adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        function(adError) {
            this.plyrAdContainer.remove();
        }.bind(this),
        false);

    // Request video ads.
    let adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = 'https://search.spotxchange.com/vast/2.0/85394?VPAID=JS&media_transcoding=low&content_page_url=https%3A//local.gamer.nl%3A3000/artikelen/nieuws/met-een-video_url/&player_width=640&player_height=360&cb=43460';
    this.adsLoader.requestAds(adsRequest);
  }

  function _createAdDisplayContainer() {
    // We assume the adContainer is the DOM id of the element that will house
    // the ads.
   this.adDisplayContainer = new google.ima.AdDisplayContainer(
            this.plyrAdContainer);
  }

  function _playAds() {

    // Initialize the container. Must be done via a user action on mobile devices.
    this.adDisplayContainer.initialize();

    // Initialize the ads manager. Ad rules playlist will start at this time.
    this.adsManager.init(this.plyrContainer.offsetWidth, this.plyrContainer.offsetHeight, google.ima.ViewMode.NORMAL);
    // Call play to start showing the ad. Single video and overlay ads will
    // start at this time; the call will be ignored for ad rules.
    try {
        this.adsManager.start();
    } catch (adError) {
      // An error may be thrown if there was a problem with the VAST response.
      this.plyr.play();
      this.plyrAdContainer.remove();
    }
  }

  function _onAdsManagerLoaded(adsManagerLoadedEvent) {
    // Get the ads manager.
    let adsRenderingSettings = new google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
    this.adsManager = adsManagerLoadedEvent.getAdsManager(adsRenderingSettings);

    // Add listeners to the required events.
    this.adsManager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        function(e) {
            this.onAdError(e);
        }.bind(this));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        function(e) {
            this.onContentResumeRequested(e);
        }.bind(this));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        function(e) {
            this.onAdEvent(e);
        }.bind(this));

    // Listen to any additional events, if necessary.
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.LOADED,
        function(e) {
            this.onAdEvent(e);
        }.bind(this));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.STARTED,
        function(e) {
            this.onAdEvent(e);
        }.bind(this));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.COMPLETE,
        function(e) {
            this.onAdEvent(e);
        }.bind(this));

    // Listen to the resizing of the window. And resize
    // ad accordingly.
    window.addEventListener(
        'resize',
        function(e) {
            this.adsManager.resize(
                this.plyrContainer.offsetWidth,
                this.plyrContainer.offsetHeight,
                google.ima.ViewMode.NORMAL);
        }.bind(this));
  }

  function _onAdEvent(adEvent) {
    // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
    // don't have ad object associated.
    let ad = adEvent.getAd();
    switch (adEvent.type) {
      case google.ima.AdEvent.Type.LOADED:
        // This is the first event sent for an ad - it is possible to
        // determine whether the ad is a video ad or an overlay.
        if (!ad.isLinear()) {
          // Position AdDisplayContainer correctly for overlay.
          // Use ad.width and ad.height.
          this.plyr.play();
          this.plyrAdContainer.remove();
        }
        break;
      case google.ima.AdEvent.Type.STARTED:
        // This event indicates the ad has started - the video player
        // can adjust the UI, for example display a pause button and
        // remaining time.
        if (ad.isLinear()) {
          // For a linear ad, a timer can be started to poll for
          // the remaining time.
          this.intervalTimer = setInterval(
              function() {
                let remainingTime = this.adsManager.getRemainingTime();
              }.bind(this),
              300); // every 300ms
        }
        break;
      case google.ima.AdEvent.Type.COMPLETE:
        // This event indicates the ad has finished - the video player
        // can perform appropriate UI actions, such as removing the timer for
        // remaining time detection.

        // Start playing the video.
        this.plyr.play();
        // Remove ads container.
        this.plyrAdContainer.remove();
        if (ad.isLinear()) {
          clearInterval(this.intervalTimer);
        }
        break;
    }
  }

  function _onAdError(adErrorEvent) {
    // Handle the error logging.
    this.adsManager.destroy();
    throw new Error(adErrorEvent.getError());
  }

  function _onContentResumeRequested() {
    // Start playing the video.
    this.plyr.play();
    // This function is where you should ensure that your UI is ready
    // to play content. It is the responsibility of the Publisher to
    // implement this function when necessary.
    // setupUIForContent();
  }

  // Setup function
  function setup(plyr, config) {
    // Bail if plyr instances aren't found.
    if (!plyr) return false;

    // Loop through plyr instances and add ads.
    plyr.forEach(instance => {
        instance.on('ready', () => {
            instance.plyrAds = new PlyrAds(instance, config);
        });
    });
  }


  return {
    setup: setup
  };

}));
