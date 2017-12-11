 
/**
 * TODO
 * - When seeking mid rolls start playing after seeked.
 *   Possible solution: Invoke discardAdBreak for every skipped mid-roll.
 */


import defaults from './defaults';
import { utils } from './utils';

class PlyrAds {

  constructor(target, options) {
    
    // Set config
    this.config = utils.mergeConfig(defaults, options);

    // Check if a adTagUrl us provided.
    if (!this.config.adTagUrl && this.config.debug) {
      if (this.config.debug) {
        throw new Error('No adTagUrl provided.');
      }
      return;
    }

    // Check if the Google IMA3 SDK is loaded.
    if (!window.google) {
      if (this.config.debug) {
        throw new Error('The Google IMA3 SDK is not loaded.');
      }
      return;
    }
    
    this.plyr = target;
    this.startEvents = utils.getStartEvents();
    this.adDisplayContainer;
    this.adDisplayElement;
    this.adsManager;
    this.adsLoader;
    this.videoElement = document.createElement('video');

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
    this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer, this.videoElement);

    // Tell the adsLoader we are handling ad breaks manually.
    this.adsLoader.getSettings().setAutoPlayAdBreaks(false);

    // Listen and respond to ads loaded and error events.
    this.adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        adEvent => this._onAdsManagerLoaded(adEvent),
        false);
    this.adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        adError => this._onAdError(adError),
        false);

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

    // The SDK is polling currentTime on the contentPlayback. And needs a duration
    // so it can determine when to start the mid- and post-roll.
    this.adsManager = adsManagerLoadedEvent.getAdsManager(
      videoElement, adsRenderingSettings);

    // Add listeners to the required events.
    this.adsManager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        adError => this._onAdError(adError));
    // this.adsManager.addEventListener(
    //     google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
    //     adEvent => this._onContentPauseRequested(adEvent));
    // this.adsManager.addEventListener(
    //     google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
    //     adEvent => this._onContentResumeRequested(adEvent));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        adEvent => this._onAdEvent(adEvent));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.AD_BREAK_READY,
        adEvent => {
          this.plyr.pause();
          this.adsManager.start();
        });

    // Listen to any additional events, if necessary.
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.LOADED,
        adEvent => this._onAdEvent(adEvent));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.STARTED,
        adEvent => this._onAdEvent(adEvent));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.COMPLETE,
        adEvent => this._onAdEvent(adEvent) );
  }

  _onAdEvent(adEvent) {
    
    const { container } = this.plyr.elements;

    // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
    // don't have ad object associated.
    const ad = adEvent.getAd();

    // let intervalTimer;
    
    switch (adEvent.type) {
      case google.ima.AdEvent.Type.LOADED:
        console.log('LOADED');
        this.adDisplayElement.style.display = 'block';
        // This is the first event sent for an ad - it is possible to
        // determine whether the ad is a video ad or an overlay.
        if (!ad.isLinear()) {
          
          // Position AdDisplayContainer correctly for overlay.
          ad.width = container.offsetWidth;
          ad.height = container.offsetHeight;
        }
        break;
      case google.ima.AdEvent.Type.STARTED:
        console.log('STARTED');
        // Show the ad display element.
        // This event indicates the ad has started - the video player
        // can adjust the UI, for example display a pause button and
        // remaining time.
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
      case google.ima.AdEvent.Type.COMPLETE:
        // This event indicates the ad has finished - the video player
        // can perform appropriate UI actions, such as removing the timer for
        // remaining time detection.
        // clearInterval(intervalTimer);

        this.adDisplayElement.style.display = 'none';
        if (this.plyr.currentTime < this.plyr.duration) {
          this.plyr.play();
        }
        break;
      case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
        this._emitEvent('ALL_ADS_COMPLETED');
        this.plyr.stop();
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
  
  /**
   * This function is where you should setup UI for showing ads (e.g.
   * display ad timer countdown, disable seeking etc.)
   */
  _onContentPauseRequested() {

    // Pause the player.
    this.plyr.pause();
  }

  /**
   * This function is where you should ensure that your UI is ready
   * to play content. It is the responsibility of the Publisher to
   * implement this function when necessary.
   */
  _onContentResumeRequested() {

    // Resume the player.
    this.plyr.play();
  }

  _setupAdDisplayContainer() {
    const { container, original } = this.plyr.elements;
      
    // We assume the adContainer is the video container of the plyr element
    // that will house the ads.
    this.adDisplayContainer = new google.ima.AdDisplayContainer(container);

    this.adDisplayElement = container.firstChild;

    // The AdDisplayContainer call from google IMA sets the style attribute
    // by default. We remove the inline style and set it through the stylesheet.
    this.adDisplayElement.removeAttribute('style');
    
    // Set class name on the adDisplayContainer element.
    this.adDisplayElement.setAttribute('class', 'plyr-ads');

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

    // Add listeners to the required events.
    this.plyr.on('ended', event => {
      this.adsLoader.contentComplete();
    });

    this.plyr.on('timeupdate', event => {
      const { currentTime } = event.detail.plyr;
      this.videoElement.currentTime = Math.ceil(currentTime);
    });
    
    this.plyr.on('seeked', event => {
      const { currentTime } = event.detail.plyr;
      const cuePoints = this.adsManager.getCuePoints();

      let adsSkipped = 0;

      // Count the amount of mid-rolls which will be
      // skipped.
      for (let i = 0; i < cuePoints.length; i++) {
        const cuePoint = cuePoints[i];
        if (cuePoint < currentTime && cuePoint !== -1 && cuePoint !== 0) {
          adsSkipped++;
        }
      }

      // Discard ad breaks for every mid-roll skipped.
      // This ensures the mid-rolls don't start running when the 
      // video is seeked past a mid-roll.
      for (let j = 0; j < adsSkipped; j++) {
        this.adsManager.discardAdBreak();
      }
    });

    // Listen to the resizing of the window. And resize ad accordingly.
    window.addEventListener('resize', () => {
      this.adsManager.resize(
        container.offsetWidth,
        container.offsetHeight,
        google.ima.ViewMode.NORMAL
      );
    });
  }

  /**
   * Set start event listener on a DOM element and triggers the
   * callback when clicked.
   * @param {HtmlElment} element - The element on which to set the listener 
   * @param {Function} callback - The callback which will be invoked once triggered.
   */ 
  _setOnClickHandler(element, callback) {
    for (let startEvent of this.startEvents) {
      element.addEventListener(startEvent, (event) => {
        if (event.type === 'touchend' &&
            startEvent === 'touchend' ||
            event.type === 'click') {
          callback.call(this);
        }
      }, {once: true});
    }
  }

  /**
   * Add event listeners
   * @param {string} event - Event type
   * @param {function} callback - Callback for when event occurs
   */
  on(event, callback) {
    utils.on(this.elements.container, event, callback);
    return this;
  }
}

export default {
  init: (target, options) => new PlyrAds(target, options)
};
