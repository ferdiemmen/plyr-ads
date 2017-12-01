
import defaults from './defaults';

class PlyrAds {

  constructor(target, options) {
    this.config = this._mergedConfig(defaults, options);
    this.plyr = target;
    this.adDisplayContainer;

    if (!this.config.adTagUrl) {
      throw Error('No adTagUrl provided.');
    }

    this._createAdDisplayContainer();

    // Request video ads.
    // this.adsRequest = new google.ima.AdsRequest();
    // adsRequest.adTagUrl = config.adTagUrl;

    // Set listeners on plyr media events.
    this._setListeners();
  }


  _createAdDisplayContainer() {
    // We assume the adContainer is the video wrapper of the plyr element that will house
    // the ads.
    const { wrapper, original } = this.plyr.elements;

    this.adDisplayContainer = new google.ima.AdDisplayContainer(
        wrapper, original);

    console.log(this.adDisplayContainer);
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
