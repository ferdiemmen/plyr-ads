
import defaults from './defaults';

class PlyrAds {

  constructor(target, options) {
    this.config = this._mergedConfig(defaults, options);
    this.config.startEvents = this._getStartEvents();
    
    this.plyr = target;
    this.adDisplayContainer;
    this.adDisplayElement;

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
    this.adsRequest = new google.ima.AdsRequest();
    this.adsRequest.adTagUrl = 'https' // this.config.adTagUrl;
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

    try {
      // Initialize the ads manager. Ad rules playlist will start at this time.
      this.adsManager.init(
        container.offsetWidth,
        container.offsetHeight,
        window.google.ima.ViewMode.NORMAL
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
