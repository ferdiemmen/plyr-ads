/**
 * TODO
 * - When seeking mid rolls start playing after seeked.
 *   Possible solution: Invoke discardAdBreak for every skipped mid-roll.
 * - Send out ".on" events when specific ad events happen.
 */

import defaults from "./defaults";
import { utils } from "./utils";

class PlyrAds {
  constructor(target, options) {
    // Set config
    this.config = utils.mergeConfig(defaults, options);

    // Check if an adTagUrl is provided.
    if (!this.config.adTagUrl) {
      if (this.config.debug) {
        throw new Error("No adTagUrl provided.");
      }
      return this;
    }

    // Check if the Google IMA3 SDK is loaded.
    if (!window.google) {
      if (this.config.debug) {
        throw new Error("The Google IMA3 SDK is not loaded.");
      }
      return this;
    }

    this.plyr = target;
    this.startEvents = utils.getStartEvents();
    this.adDisplayContainer;
    this.adDisplayElement;
    this.adsManager;
    this.adsLoader;
    this.adCuePoints;
    this.currentAd;
    this.events = {};
    this.videoElement = document.createElement("video");

    // Setup the ad display container.
    this._setupAdDisplayContainer();

    // Setup the IMA SDK.
    this._setupIMA();

    // Set listeners on the Plyr instance.
    this._setupListeners();
  }

  _setupIMA() {
    const { container } = this.plyr.elements;

    // Create ads loader.
    this.adsLoader = new google.ima.AdsLoader(
      this.adDisplayContainer,
      this.videoElement
    );

    // Tell the adsLoader we are handling ad breaks manually.
    this.adsLoader.getSettings().setAutoPlayAdBreaks(false);

    // Listen and respond to ads loaded and error events.
    this.adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      adEvent => this._onAdsManagerLoaded(adEvent),
      false
    );
    this.adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      adError => this._onAdError(adError),
      false
    );

    // Request video ads.
    const adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = this.config.adTagUrl;

    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    adsRequest.linearAdSlotWidth = container.offsetWidth;
    adsRequest.linearAdSlotHeight = container.offsetHeight;
    adsRequest.nonLinearAdSlotWidth = container.offsetWidth;
    adsRequest.nonLinearAdSlotHeight = container.offsetHeight;

    this.adsLoader.requestAds(adsRequest);
  }

  _onAdsManagerLoaded(adsManagerLoadedEvent) {
    const { videoElement } = this;

    // Get the ads manager.
    const adsRenderingSettings = new google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
    adsRenderingSettings.enablePreloading = true;

    // The SDK is polling currentTime on the contentPlayback. And needs a duration
    // so it can determine when to start the mid- and post-roll.
    this.adsManager = adsManagerLoadedEvent.getAdsManager(
      videoElement,
      adsRenderingSettings
    );

    // Get the cue points for any mid-rolls by filtering out the pre- and post-roll.
    this.adsCuePoints = this.adsManager
      .getCuePoints()
      .filter(x => x > 0 && x !== -1);

    // Add listeners to the required events.
    this.adsManager.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      adError => this._onAdError(adError)
    );
    this.adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      adEvent => this._onAdEvent(adEvent));
    this.adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      adEvent => this._onAdEvent(adEvent));
    this.adsManager.addEventListener(
      google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      adEvent => this._onAdEvent(adEvent)
    );
    this.adsManager.addEventListener(
      google.ima.AdEvent.Type.AD_BREAK_READY,
      adEvent => this._onAdEvent(adEvent)
    );

    // Listen to any additional events, if necessary.
    this.adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, adEvent =>
      this._onAdEvent(adEvent)
    );
    this.adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, adEvent =>
      this._onAdEvent(adEvent)
    );
    this.adsManager.addEventListener(
      google.ima.AdEvent.Type.COMPLETE,
      adEvent => this._onAdEvent(adEvent)
    );
  }

  _onAdEvent(adEvent) {
    const { container } = this.plyr.elements;

    // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
    // don't have ad object associated.
    const ad = adEvent.getAd();

    // Set the currently played ad. This information could be used by callback
    // events.
    this.currentAd = ad;

    // let intervalTimer;

    switch (adEvent.type) {
      case google.ima.AdEvent.Type.LOADED:
        // This is the first event sent for an ad - it is possible to
        // determine whether the ad is a video ad or an overlay.

        // Show the ad display element.
        this.adDisplayElement.style.display = "block";

        this._handleEventListeners("LOADED");

        if (!ad.isLinear()) {
          // Position AdDisplayContainer correctly for overlay.
          ad.width = container.offsetWidth;
          ad.height = container.offsetHeight;
        }
        break;
      case google.ima.AdEvent.Type.STARTED:
        // This event indicates the ad has started - the video player
        // can adjust the UI, for example display a pause button and
        // remaining time.

        this.plyr.pause();
        this._handleEventListeners("STARTED");

        // if (ad.isLinear()) {
        // For a linear ad, a timer can be started to poll for
        // the remaining time.
        // intervalTimer = setInterval(
        //     () => {
        //       let remainingTime = this.adsManager.getRemainingTime();
        //       console.log(remainingTime);
        //     },
        //     300); // every 300ms
        // }
        break;
      case google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED:
        this._handleEventListeners("CONTENT_PAUSE_REQUESTED");
        break;
      case google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED:
        this._handleEventListeners("CONTENT_RESUME_REQUESTED");
        break;
      case google.ima.AdEvent.Type.AD_BREAK_READY:
        // This event indicates that a mid-roll ad is ready to start.
        // We pause the player and tell the adsManager to start playing the ad.
        this.plyr.pause();
        this.adsManager.start();
        this._handleEventListeners("AD_BREAK_READY");
        break;
      case google.ima.AdEvent.Type.COMPLETE:
        // This event indicates the ad has finished - the video player
        // can perform appropriate UI actions, such as removing the timer for
        // remaining time detection.
        // clearInterval(intervalTimer);
        this._handleEventListeners("COMPLETE");

        this.adDisplayElement.style.display = "none";
        if (this.plyr.currentTime < this.plyr.duration) {
          this.plyr.play();
        }
        break;
      case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
        this._handleEventListeners("ALL_ADS_COMPLETED");
        break;
      default:
        break;
    }
  }

  _onAdError(adErrorEvent) {
    // Handle the error logging.
    this.adDisplayElement.remove();

    if (this.adsManager) {
      this.adsManager.destroy();
    }

    if (this.config.debug) {
      throw new Error(adErrorEvent);
    }
  }

  _setupAdDisplayContainer() {
    const { container, original } = this.plyr.elements;

    // We assume the adContainer is the video container of the plyr element
    // that will house the ads.
    this.adDisplayContainer = new google.ima.AdDisplayContainer(container);

    this.adDisplayElement = container.firstChild;

    // The AdDisplayContainer call from google IMA sets the style attribute
    // by default. We remove the inline style and set it through the stylesheet.
    this.adDisplayElement.removeAttribute("style");

    // Set class name on the adDisplayContainer element.
    this.adDisplayElement.setAttribute("class", "plyr-ads");

    // Play ads when clicked.
    this._setOnClickHandler(this.adDisplayElement, this._playAds);
  }

  _playAds() {
    const { container } = this.plyr.elements;

    // Initialize the container. Must be done via a user action on mobile devices.
    this.adDisplayContainer.initialize();

    try {
      // Initialize the ads manager. Ad rules playlist will start at this time.
      this.adsManager.init(
        container.offsetWidth,
        container.offsetHeight,
        google.ima.ViewMode.NORMAL
      );

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

  /**
   * Setup hooks for Plyr and window events. This ensures
   * the mid- and post-roll launch at the correct time. And
   * resize the advertisement when the player resizes.
   */
  _setupListeners() {
    const { container } = this.plyr.elements;
    let currentTime;

    // Add listeners to the required events.
    this.plyr.on("ended", event => {
      this.adsLoader.contentComplete();
    });

    this.plyr.on("timeupdate", event => {
      const { currentTime } = event.detail.plyr;
      this.videoElement.currentTime = Math.ceil(currentTime);
    });

    this.plyr.on(
      "seeking",
      event => (currentTime = event.detail.plyr.currentTime)
    );

    this.plyr.on("seeked", event => {
      const seekedTime = event.detail.plyr.currentTime;

      for (let i = 0; i < this.adsCuePoints.length; i++) {
        const cuePoint = this.adsCuePoints[i];
        if (currentTime < cuePoint && cuePoint < seekedTime) {
          this.adsManager.discardAdBreak();
          this.adsCuePoints.splice(i, 1);
        }
      }
    });

    // Listen to the resizing of the window. And resize ad accordingly.
    window.addEventListener("resize", () => {
      this.adsManager.resize(
        container.offsetWidth,
        container.offsetHeight,
        google.ima.ViewMode.NORMAL
      );
    });
  }

  /**
   * Handles callbacks after an ad event was invoked.
   */
  _handleEventListeners(event) {
    if (typeof(this.events[event]) !== 'undefined') {
      this.events[event].call(this);
    }
  }

  /**
   * Set start event listener on a DOM element and triggers the
   * callback when clicked.
   * @param {HtmlElment} element - The element on which to set the listener
   * @param {Function} callback - The callback which will be invoked once triggered.
   */

  _setOnClickHandler(element, callback) {
    for (let startEvent of this.startEvents) {
      element.addEventListener(
        startEvent,
        event => {
          if (
            (event.type === "touchend" && startEvent === "touchend") ||
            event.type === "click"
          ) {
            callback.call(this);
          }
        },
        { once: true }
      );
    }
  }

  /**
   * Add event listeners
   * @param {string} event - Event type
   * @param {function} callback - Callback for when event occurs
   */
  on(event, callback) {
    this.events[event] = callback;
    return this;
  }
}

export default {
  init: (target, options) => new PlyrAds(target, options)
};
