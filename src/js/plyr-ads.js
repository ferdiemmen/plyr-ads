
/**
 * TODO
 * 
 * - Responsive on scaling
 */ 


import defaults from './defaults';

class PlyrAds {

  constructor(target, options) {
    this.config = this._mergedConfig(defaults, options);
    this.config.startEvents = this._getStartEvents();
    
    this.plyr = target;
    this.adDisplayContainer;
    this.adDisplayElement;
    this.adsManager;
    this.adsLoader;

    // Check if a adTagUrl us provided.
    if (!this.config.adTagUrl) { throw new Error('No adTagUrl provided.'); }

    // Check if the Google IMA3 SDK is loaded.
    if (!window.google) { throw new Error('The Google IMA3 SDK is not loaded.'); }

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
    this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);

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
    const { original } = this.plyr.elements;

    // Get the ads manager.
    const adsRenderingSettings = new google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
    
    console.log(this.plyr.currentTime);
    console.log(this.plyr.duration);

    // The SDK is polling currentTime on the contentPlayback. And needs a duration
    // so it can determine when to start the mid- and post-roll.
    this.adsManager = adsManagerLoadedEvent.getAdsManager(
      {
        currentTime: this.plyr.currentTime,
        duration: this.plyr.duration
      }, adsRenderingSettings);

    // Add listeners to the required events.
    this.adsManager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        adError => this._onAdError(adError));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        adEvent => this._onContentPauseRequested(adEvent));
  //   this.adsManager.addEventListener(
  //       google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
  //       this._onContentResumeRequested.bind(this));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        adEvent => this._onAdEvent(adEvent));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.AD_BREAK_READY,
        () => {
          console.log('AD_BREAK_READY');
          // this.adsManager.start();
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
        // This is the first event sent for an ad - it is possible to
        // determine whether the ad is a video ad or an overlay.
        if (!ad.isLinear()) {
          // Position AdDisplayContainer correctly for overlay.
          ad.width = container.offsetWidth;
          ad.height = container.offsetHeight;
        }
        break;
      case google.ima.AdEvent.Type.STARTED:
        console.log('STARTED')
  //       // This event indicates the ad has started - the video player
  //       // can adjust the UI, for example display a pause button and
  //       // remaining time.
  //       if (ad.isLinear()) {
  //         // For a linear ad, a timer can be started to poll for
  //         // the remaining time.
  //         // intervalTimer = setInterval(
  //         //     () => {
  //         //       let remainingTime = this.adsManager.getRemainingTime();
  //         //       console.log(remainingTime);
  //         //     },
  //         //     300); // every 300ms
  //       }
        break;
      case google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED:
        console.log('CONTENT_PAUSE_REQUESTED')
      case google.ima.AdEvent.Type.COMPLETE:
        console.log('COMPLETE');
        this.plyr.play();
  //       // This event indicates the ad has finished - the video player
  //       // can perform appropriate UI actions, such as removing the timer for
  //       // remaining time detection.
  //       // clearInterval(intervalTimer);
        break;
      case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
        console.log('ALL_ADS_COMPLETED')
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
  
  _onContentPauseRequested() {
    console.log('CONTENT_RESUME_REQUESTED');
  //   // This function is where you should setup UI for showing ads (e.g.
  //   // display ad timer countdown, disable seeking etc.)
  //   // setupUIForAds();
  }

  // _onContentResumeRequested() {
  //   this.plyr.play();
  //   // This function is where you should ensure that your UI is ready
  //   // to play content. It is the responsibility of the Publisher to
  //   // implement this function when necessary.
  //   // setupUIForContent();
  // }

  _setupAdDisplayContainer() {
    const { container, original } = this.plyr.elements;
      
    // We assume the adContainer is the video container of the plyr element
    // that will house the ads.
    this.adDisplayContainer = new google.ima.AdDisplayContainer(container);

    this.adDisplayElement = container.firstChild;

    // The AdDisplayContainer call from google ima sets the style attribute
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

    // Initialize the ads manager. Ad rules playlist will start at this time.
    this.adsManager.init(
      container.offsetWidth,
      container.offsetHeight,
      google.ima.ViewMode.NORMAL
    );

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

  _setupListeners() {

    // Add listeners to the required events.
    this.plyr.on('ended', (event) => {
      console.log('ENDED');
      this.adsLoader.contentComplete();
    });
    this.plyr.on('statechange', (event) => {
      if (event.detail.code === 1) {
        console.log('YOUTUBE ENDED');
        this.adsLoader.contentComplete();
      } 
    });

  }

  // Set's a start event listener on a DOM element and triggers the
  // callback when clicked. 
  _setOnClickHandler(element, callback) {
    for (let startEvent of this.config.startEvents) {
      element.addEventListener(startEvent, (event) => {
        if (event.type === 'touchend' &&
            startEvent === 'touchstart' ||
            event.type === 'click') {
          callback.call(this);
        }
      }, {once: true});
    }
  }

  // Merge defaults and options.
  _mergedConfig(defaults, options) {
    return {...defaults, ...options};
  }

  // Events are different on various devices. We det the correct events, based on userAgent.
  _getStartEvents() {
    let startEvents = ['click'];
    
    // For mobile users the start event will be one of
    // touchstart, touchend and touchmove.
    if (navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/Android/i)) {
        startEvents = ['touchstart', 'touchend', 'touchmove'];
    }
    return startEvents;
  }
}

export default {
  init: (target, options) => new PlyrAds(target, options)
};
