
const defaults = {
  container: 'plyr-ads',
  adTagUrl: '',
  type: '',
  skipButton: {
    enabled: true,
    text: 'Skip ad',
    delay: 10
  },
}

class PlyrAds {

  constructor(plyrInstance, config) {
    this.plyrInstance = plyrInstance;
    this.plyrContainer = plyrInstance.getContainer();
    this.adDisplayContainer;
    this.adPaused = false;
    this.config = config;

    // Initialize
    this.init = () => {
      if (this.config.type === 'ima' && !window.google) {
        throw new Error('You\'ve specified PlyrAds for type \'ima\' but the Google IMA SDK is not loaded.');
      }

      // Create the ad display container.
      this._createAdDisplayContainer[this.config.type].call(this);

      // Set advertisments.
      this._setUpAds[this.config.type].call(this);
      
      // Bind click event to adDisplayContainer.
      this._bindEventToAdDisplayContainer();
    }

    this._createAdDisplayContainer = {
      ima: () => {
        this.adDisplayContainer = new window.google.ima.AdDisplayContainer(
          this.plyrContainer
        );
        this.adDisplayContainer.I.setAttribute('class', 'plyr-ads');
      },
      youtube: () => {
        this.adDisplayContainer = _insertElement('div', this.plyrContainer, {
          class: this.config.container
        });
      }
    }

    this._createAdSkipButton = () => {
      let skipTimer = this.config.skipButton.delay;

      this.adSkipButton = _insertElement('button', this.plyrContainer, {
        class: 'plyr-ads__skip-button'
      });
      this.adSkipButton.innerHTML = 'You can skip to video in ' + (skipTimer--);

      let skipButtonTimer = window.setInterval(() => {
        if (!this.adPaused) {
          this.adSkipButton.innerHTML = 'You can skip to video in ' + skipTimer--;
        }
        if ((skipTimer + 1) === 0) {
          this.adSkipButton.className += ' done';
          this.adSkipButton.innerHTML = this.config.skipButton.text;
          this.adSkipButton.addEventListener(_getStartEvent(), () => {
            this._playVideo();
          }, false);
          window.clearInterval(skipButtonTimer);
        }
      }, 1000);
    }

    this._bindEventToAdDisplayContainer = () => {
      
      // Bind click (touchstart on mobile) to adDisplayContainer.
      let container = (this.config.type === 'ima') ? 
                       this.adDisplayContainer.I : this.adDisplayContainer;

      container.addEventListener(_getStartEvent(), () => {
        this._playAds();
      }, false);
    }

    this._setUpAds = {
      ima: () => {
        // Create ads loader.
        this.adsLoader = new window.google.ima.AdsLoader(this.adDisplayContainer);

        // Listen and respond to ads loaded and error events.
        this.adsLoader.addEventListener(
          window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
          (e) => {
            this._onAdsManagerLoaded(e);
          }, false);
        this.adsLoader.addEventListener(
          window.google.ima.AdErrorEvent.Type.AD_ERROR,
          () => {
            this._playVideo();
          }, false);

        // Request video ads.
        let adsRequest = new window.google.ima.AdsRequest();
        adsRequest.adTagUrl = this.config.adTagUrl;
        this.adsLoader.requestAds(adsRequest);
      },
      youtube: () => {
        this.adDisplayContainer.classList.add('plyr-ads__youtube');
        this.adDisplayContainer.setAttribute('data-type', 'youtube');
        this.adDisplayContainer.setAttribute('data-video-id', 't6QHnrrNIKA');

        this.adsManager = window.plyr.setup(this.adDisplayContainer, {
          controls: [],
        });

        this.adsManager[0].on('ready', (e) => {
          e.detail.plyr.getContainer().getElementsByClassName('plyr__controls')[0].remove();
        });
      }
    }

    this._onAdsManagerLoaded = (adsManagerLoadedEvent) => {

      // Get the ads manager.
      var adsRenderingSettings = new window.google.ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
      this.adsManager = adsManagerLoadedEvent.getAdsManager(adsRenderingSettings);

      // Add listeners to the required events.
      this.adsManager.addEventListener(
        window.google.ima.AdErrorEvent.Type.AD_ERROR,
        (e) => {
          this._onAdError(e);
        });
      this.adsManager.addEventListener(
        window.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        (e) => {
          this._onContentResumeRequested(e);
        });
      this.adsManager.addEventListener(
        window.google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED,
        (e) => {
          this._onContentSkippable(e);
        });
      this.adsManager.addEventListener(
        window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        (e) => {
          this._onAdEvent(e);
        });

      // Listen to any additional events, if necessary.
      this.adsManager.addEventListener(
        window.google.ima.AdEvent.Type.LOADED,
        (e) => {
          this._onAdEvent(e);
        });
      this.adsManager.addEventListener(
        window.google.ima.AdEvent.Type.STARTED,
        (e) => {
          this._onAdEvent(e);
        });
      this.adsManager.addEventListener(
        window.google.ima.AdEvent.Type.PAUSED,
        (e) => {
          this._onAdEvent(e);
        });
      this.adsManager.addEventListener(
        window.google.ima.AdEvent.Type.RESUMED,
        (e) => {
          this._onAdEvent(e);
        });
      this.adsManager.addEventListener(
        window.google.ima.AdEvent.Type.COMPLETE,
        (e) => {
          this._onAdEvent(e);
        });

      // Listen to the resizing of the window. And resize
      // ad accordingly.
      window.addEventListener(
        'resize',
        () => {
          this.adsManager.resize(
            this.plyrContainer.offsetWidth,
            this.plyrContainer.offsetHeight,
            window.google.ima.ViewMode.NORMAL);
        }
      );
    }

  this._onAdEvent = (adEvent) => {
    // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
    // don't have ad object associated.
    const ad = adEvent.getAd();

    switch (adEvent.type) {
      case window.google.ima.AdEvent.Type.LOADED:
        // This is the first event sent for an ad - it is possible to
        // determine whether the ad is a video ad or an overlay.
        if (!ad.isLinear()) {
          // Position AdDisplayContainer correctly for overlay.
          // Use ad.width and ad.height.
          this._playVideo();
        }
        break;
      case window.google.ima.AdEvent.Type.STARTED:
        // This event indicates the ad has started - the video player
        // can adjust the UI, for example display a pause button and
        // remaining time.
        if (ad.isLinear()) {
          // For a linear ad, a timer can be started to poll for
          // the remaining time.
          if (ad.getDuration() > this.config.skipButton.delay) {
            // Add ad skip button to DOM.
            this._createAdSkipButton();
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
        this._playVideo();
        break;
      default:
        break;
    }
  }

    this.onAdError = (adErrorEvent) => {
      
      // Handle the error logging.
      this.adsManager.destroy();
      this._playVideo();
      throw new Error(adErrorEvent.getError());
    }

    this._onContentResumeRequested = () => {
      
      // Start playing the video.
      this._playVideo();
    }

    this._playAds = () => {
      
      switch (this.config.type) {
        case 'ima':
          // Initialize the container. Must be done via a user action on mobile devices.
          this.adDisplayContainer.initialize();

          // Initialize the ads manager. Ad rules playlist will start at this time.
          this.adsManager.init(this.plyrContainer.offsetWidth, this.plyrContainer.offsetHeight, window.google.ima.ViewMode.NORMAL);

          // Call play to start showing the ad. Single video and overlay ads will
          // start at this time; the call will be ignored for ad rules.
          this.adsManager.start();
          break;
        case 'youtube':
          this.adDisplayContainer.style.visibility = 'visible';

          // Call play to start showing the ad.
          if (this.config.type === 'youtube' &&
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/Android/i)) {
            // Due to restrictions in some mobile devices, functions and parameters
            // such as autoplay, playVideo(), loadVideoById() won't work in all
            // mobile environments.
            this.adsManager.getEmbed().playVideoAt(0);
          } else {
            // this.adsManager.play();
          }

          // Start playing video after the youtube preroll has ended.
          // this.adsManager[0].on('ended', () => {
          //   this._playVideo();
          // });
          break;
        default:
          break;
      }
    }

    this._onContentSkippable = () => {
      // Display the ad skip button.
      this.adSkipButton.style.display = 'block';
    }

    this._playVideo = () => {
      // Remove ad skip button.
      if (this.adSkipButton) {
        this.adSkipButton.remove();
      }
      
      // Remove ad overlay.
      let container = (this.config.type === 'ima') ? 
                       this.adDisplayContainer.I : this.adDisplayContainer;
      container.remove();

      if (this.config.type === 'youtube' &&
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/Android/i)) {
        // Due to restrictions in some mobile devices, functions and parameters
        // such as autoplay, playVideo(), loadVideoById() won't work in all
        // mobile environments.
        this.plyrInstance.getEmbed().playVideoAt(0);
      } else {
        this.plyrInstance.play();
      }
    }
  };

  static setup(plyrInstances, config) {
    let plyrAdInstances = [];

    // Wrap single instances in an Array so we can loop it. 
    if (!plyrInstances.length) {
      plyrInstances = [plyrInstances];
    }

    plyrInstances.forEach((instance) => {
      let plyrAdInstance = new PlyrAds(instance, _extend({}, defaults, config));

      // Push new PlyrAds instance so we can return the instances.
      plyrAdInstances.push(plyrAdInstance);

      // Initialize the new instance.
      plyrAdInstance.init();
    });
    return plyrAdInstances;
  }
}


/////////////////////////////////
// Utils
/////////////////////////////////

// Check variable types.
const _is = {
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

// Prepend child
function _prependChild(parent, element) {
  return parent.insertBefore(element, parent.firstChild);
}

// Set attributes
function _setAttributes(element, attributes) {
  for (var key in attributes) {
    if (Object.prototype.hasOwnProperty.call(attributes, key)) {
      element.setAttribute(key, (_is.boolean(attributes[key]) && attributes[key]) ? '' : attributes[key]);
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
  let startEvent = 'click';

  if (navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/Android/i)) {
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
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function _extend(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (_isObject(target) && _isObject(source)) {
    for (const key in source) {
      if (_isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        _extend(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return _extend(target, ...sources);
}