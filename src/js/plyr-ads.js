
import defaults from './defaults';

class PlyrAds {

  constructor(target, options) {
    this.config = this._mergedConfig(defaults, options);
    this.plyr = target;
    this.adDisplayContainer;
    this.adDisplayElement;

    // Check if a adTagUrl us provided.
    if (!this.config.adTagUrl) { throw Error('No adTagUrl provided.'); }

    // Check if the Google IMA3 SDK is loaded.
    if (!window.google) { throw new Error('The Google IMA3 SDK is not loaded.'); }

    // Setup the ad display container.
    this._setupAdDisplayContainer();

    // Request video ads.
    this.adsRequest = new google.ima.AdsRequest();
    this.adsRequest.adTagUrl = this.config.adTagUrl;

    // Set listeners on plyr media events.
    this._setListeners();
  }


  _setupAdDisplayContainer() {
    const { wrapper, original } = this.plyr.elements;
    
    // We assume the adContainer is the video wrapper of the plyr element that will house
    // the ads.
    this.adDisplayContainer = new google.ima.AdDisplayContainer(
        wrapper, original);

    this.adDisplayElement = wrapper.firstChild;

    // The AdDisplayContainer call from google ima sets the style attribute
    // by default. We remove the inline style and set it through the stylesheet.
    this.adDisplayElement.removeAttribute('style');
    
    // Set class name on the adDisplayContainer element
    this.adDisplayElement.setAttribute('class', 'plyr-ads');
  }

  // Merge defaults and options.
  _mergedConfig(defaults, options) {
    return {...defaults, ...options};
  }

  _setListeners() {

    // Progress
    this.plyr.on('progress', (event) => {
      const { currentTime } = event.detail.plyr;
    });
  }
}

export default {
  init: (target, options) => new PlyrAds(target, options)
};
