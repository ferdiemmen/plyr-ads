
import defaults from './defaults';

class PlyrAds {

  constructor(target, options) {
    this.config = this._mergedConfig(defaults, options);
    this.config.startEvents = this._getStartEvents();
    
    this.plyr = target;
    this.adDisplayContainer;
    this.adDisplayElement;
    this.adsManager;
    this.currentTime = 0;

    // Check if a adTagUrl us provided.
    if (!this.config.adTagUrl) { throw new Error('No adTagUrl provided.'); }

    // Check if the Google IMA3 SDK is loaded.
    if (!window.google) { throw new Error('The Google IMA3 SDK is not loaded.'); }

    // Setup the ad display container.
    this._setupAdDisplayContainer();

    this._setupIMA();

    // Set listeners on plyr media events.
    this._setListeners();
  }

  _setupIMA() {
    // Request video ads.
    const adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = this.config.adTagUrl;

    // Create ads loader.
    this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);

    // Listen and respond to ads loaded and error events.
    this.adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        this._onAdsManagerLoaded.bind(this),
        false);
    this.adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        this._onAdError.bind(this),
        false);

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

  _onAdsManagerLoaded(adsManagerLoadedEvent) {

    const { original } = this.plyr.elements;

    // Get the ads manager.
    const adsRenderingSettings = new google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

    const contentPlayback = {
      currentTime: this.currentTime,
      duration: this.plyr.duration
    };

    // videoContent should be set to the content video element.
    this.adsManager = adsManagerLoadedEvent.getAdsManager(
      contentPlayback, adsRenderingSettings);

    // console.log(this.adsManager.getCuePoints());

    // Add listeners to the required events.
    this.adsManager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        this._onAdError.bind(this));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        this._onContentPauseRequested.bind(this));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        this._onContentResumeRequested.bind(this));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        this._onAdEvent.bind(this));

    // Listen to any additional events, if necessary.
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.LOADED,
        this._onAdEvent.bind(this));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.STARTED,
        this._onAdEvent.bind(this));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.COMPLETE,
        this._onAdEvent.bind(this));
  }

  _onAdEvent(adEvent) {
    
    // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
    // don't have ad object associated.
    const ad = adEvent.getAd();
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

  _onAdError(adErrorEvent) {
    
    // Handle the error logging.
    this.adsManager.destroy();
    this.adDisplayElement.remove();

    if (this.config.debug) {
      throw new Error(adErrorEvent);
    }
  }
  
  _onContentPauseRequested() {
    this.plyr.pause();
    // This function is where you should setup UI for showing ads (e.g.
    // display ad timer countdown, disable seeking etc.)
    // setupUIForAds();
  }

  _onContentResumeRequested() {
    this.plyr.play();
    // This function is where you should ensure that your UI is ready
    // to play content. It is the responsibility of the Publisher to
    // implement this function when necessary.
    // setupUIForContent();
  }

  _setupAdDisplayContainer() {
    const { container, original } = this.plyr.elements;
    
    // We assume the adContainer is the video container of the plyr element
    // that will house the ads.
    this.adDisplayContainer = new google.ima.AdDisplayContainer(
        container, original);

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

  // Set's a click event listener on a DOM element and triggers the
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

  _setListeners() {

    let time = 0;

    // timeupdate
    this.plyr.on('timeupdate', (event) => {
      const { currentTime } = event.detail.plyr;

      if (time !== Math.ceil(currentTime)) {
        switch(time) {
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
