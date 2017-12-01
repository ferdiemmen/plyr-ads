
import defaults from './defaults';

class PlyrAds {

  constructor(target, options) {
    this.config = this._mergedConfig(defaults, options);
    this.plyr = target;

    // Set listeners on plyr media events
    this._setListeners();
  }

  _mergedConfig(defaults, options) {
    return {...defaults, ...options};
  }

  _setListeners() {

    // Progress
    this.plyr.on('progress', (event) => {
      const { currentTime } = event.detail.plyr;
      console.log(currentTime);
    });
  }
}

export default {
  init: (target, options) => new PlyrAds(target, options)
};
